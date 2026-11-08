# TILEVALUE1, 2026-11-07: cuts the proof pictures out of the real screens capture.mjs took, and copies
# the today tiles, into public/mockups/tile-value/. Every crop is a rectangle of a real screen, padded
# with that screen's own ground to the tile's 1200 by 630, never redrawn.
# Usage: python3 crops.py <raw folder> <today folder> <out folder>
import sys, shutil
from PIL import Image

raw, today, out = sys.argv[1:4]
W, H = 1200, 630

def fit(im, ground):
    """Pad a crop with its ground to 1200:630, then scale to 1200 by 630."""
    w, h = im.size
    if w / h < W / H:
        nw = round(h * W / H)
        canvas = Image.new('RGB', (nw, h), ground)
        canvas.paste(im, ((nw - w) // 2, 0))
    else:
        nh = round(w * H / W)
        canvas = Image.new('RGB', (w, nh), ground)
        canvas.paste(im, (0, (nh - h) // 2))
    return canvas.resize((W, H), Image.LANCZOS)

def crop(name, box):
    return Image.open(f'{raw}/{name}').convert('RGB').crop(box)

def stack(pieces, ground, gap, pad):
    """Real cuts of one screen stacked top to bottom, left-aligned, with gap and pad of its ground."""
    w = max(i.width for i in pieces) + 2 * pad
    h = sum(i.height for i in pieces) + gap * (len(pieces) - 1) + 2 * pad
    canvas = Image.new('RGB', (w, h), ground)
    y = pad
    for i in pieces:
        canvas.paste(i, (pad, y)); y += i.height + gap
    return canvas

# Each box is in the capture's own pixels (520 wide at 3x, The Undo List 1440 wide at 2x).
jobs = [
    # Revenge or Justice: its first three readings from one real reading (the Times of India Raskin
    # article, 2026-11-07), drawn large by rj-scored.html because the tool's own bars are too small
    # on a phone; names, lengths and colours are the tool's own (see that file).
    ('proof-revenge-or-justice.png', Image.open(f'{raw}/rj-scored.png').convert('RGB'), '#FFFFFF'),
    # The Undo List: two cuts of its first screen (1440 wide, 2x), stacked: the headline "Thirteen
    # signatures undo 275 things." and the top three rows of squares of the first five blocks, the
    # first block signed and gold. The paragraph, button, eyebrow and block numbers are left out.
    ('proof-undo.png', stack([crop('undo-full.png', (396, 398, 1312, 612)),
                              crop('undo-full.png', (396, 930, 1740, 1040))], '#FFFFFF', 64, 70), '#FFFFFF'),
    # Letters: one H in the live app with all three strokes drawn and numbered 1, 2, 3, each with its
    # arrow, in the app's own classes (capture.mjs, job letters, says how and why it is the composite).
    ('proof-letters.png', crop('letters-h-one.png', (0, 340, 1500, 2130)), '#E9F0F3'),
    # Which AI should I use?: the recommendation a writer handling confidential material gets, cut to
    # the model's name and its one line.
    ('proof-which-ai-should-i-use.png', crop('whichai-full.png', (140, 645, 1210, 870)), '#FFFFFF'),
    # Wonder Cards: one card from the Screen topic, its photograph's edge, the awning and the question.
    ('proof-wonder-cards.jpg', crop('wonder-full.png', (0, 1605, 1560, 2425)), '#005A63'),
]
for name, im, ground in jobs:
    pic = fit(im, ground)
    if name.endswith('.jpg'):
        pic.save(f'{out}/{name}', quality=84, optimize=True, progressive=True)
    else:
        pic.quantize(colors=128, method=Image.MEDIANCUT).save(f'{out}/{name}', optimize=True)

for slug in ['revenge-or-justice', 'undo', 'letters', 'which-ai-should-i-use', 'wonder-cards']:
    shutil.copy(f'{today}/{slug}.png' if slug != 'wonder-cards' else f'{today}/today-wonder-cards.png',
                f'{out}/today-{slug}.png')
print('wrote', len(jobs) + 5, 'pictures to', out)
