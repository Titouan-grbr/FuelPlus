#!/usr/bin/env python3
"""Actualise les prix depuis le flux officiel, sans dépendances tierces."""
import io
import os
import sys
import time
import zipfile
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

SOURCE = "https://donnees.roulez-eco.fr/opendata/instantane"
DEST = Path("instantane/PrixCarburants_instantane.xml")
MAX_ZIP_BYTES = 15_000_000
MAX_XML_BYTES = 40_000_000

def main():
    req = urllib.request.Request(SOURCE, headers={
        "User-Agent": "FuelPlus-OpenData-Updater/1.0",
        "Accept": "application/zip, application/octet-stream",
    })
    with urllib.request.urlopen(req, timeout=90) as response:
        data = response.read(MAX_ZIP_BYTES + 1)
    if len(data) > MAX_ZIP_BYTES:
        raise ValueError("Archive anormalement volumineuse")
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        matches = [i for i in archive.infolist()
                   if not i.is_dir() and i.filename.lower().endswith(".xml")]
        if len(matches) != 1:
            raise ValueError(f"Attendu un XML dans l'archive, obtenu : {len(matches)}")
        info = matches[0]
        if not (500_000 < info.file_size <= MAX_XML_BYTES):
            raise ValueError("Taille XML anormale")
        with archive.open(info) as f:
            xml = f.read(MAX_XML_BYTES + 1)
    if len(xml) > MAX_XML_BYTES:
        raise ValueError("XML trop volumineux")
    root = ET.fromstring(xml)
    if root.tag != "pdv_liste" or len(root.findall("pdv")) < 1000:
        raise ValueError("Données officielles invalides : points de vente insuffisants")
    DEST.parent.mkdir(parents=True, exist_ok=True)
    if DEST.exists() and DEST.read_bytes() == xml:
        print("Prix identiques, aucune modification.")
        return
    temp = DEST.with_suffix(".xml.tmp")
    temp.write_bytes(xml)
    temp.replace(DEST)
    print(f"Actualisé : {len(root.findall('pdv'))} stations, {len(xml)} octets.")

if __name__ == "__main__":
    main()
