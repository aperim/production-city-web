#!/usr/bin/env python3
"""Generate Production City OG and Twitter social sharing images."""

from PIL import Image, ImageDraw, ImageFont
import os

FONT_PATH = "/data/paperclip/.local/share/fonts/InterTight.ttf"
BG = "#0A0A0A"
WHI = "#EFEBE2"
RED = "#D93B2B"
GRY = "#9C9A92"
BAR = 5

def make(w, h, path):
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    f72 = ImageFont.truetype(FONT_PATH, 72)
    f100 = ImageFont.truetype(FONT_PATH, 100)
    f26  = ImageFont.truetype(FONT_PATH, 26)
    cx = w / 2
    # left red bar
    d.rectangle([0, 0, BAR, h], fill=RED)
    # PRODUCTION
    d.text((cx, 140), "PRODUCTION", fill=WHI, font=f72, anchor="mm")
    # CITY
    d.text((cx, 270), "CITY™", fill=WHI, font=f100, anchor="mm")
    # red accent line
    d.line([(cx-70, 340), (cx+70, 340)], fill=RED, width=3)
    # tagline
    d.text((cx, 400), "THE FUTURE OF SCREEN PRODUCTION", fill=GRY, font=f26, anchor="mm")
    # bottom line
    d.line([(40, h-120), (w-40, h-120)], fill=RED, width=1)
    im.save(path, "PNG", optimize=True)
    sz = os.path.getsize(path)
    print(f"  {os.path.basename(path)}: {w}x{h}, {sz:,} bytes")

make(1200, 630, "/data/productioncity/website-holding/apps/web/public/opengraph-image.png")
make(1200, 600, "/data/productioncity/website-holding/apps/web/public/twitter-image.png")
