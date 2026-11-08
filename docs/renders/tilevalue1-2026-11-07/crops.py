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

def strip(names, box, ground, gap):
    """Real frames of one screen side by side, each cut to the same box, a gap of ground between."""
    ims = [crop(n, box) for n in names]
    w = sum(i.width for i in ims) + gap * (len(ims) + 1)
    canvas = Image.new('RGB', (w, ims[0].height + gap), ground)
    x = gap
    for i in ims:
        canvas.paste(i, (x, gap // 2)); x += i.width + gap
    return canvas

# Each box is in the capture's own pixels (520 wide at 3x, The Undo List 1440 wide at 2x).
jobs = [
    # Revenge or Justice: one real reading (the Times of India Raskin article, 2026-11-07), cut to the
    # Revenge and Justice ends and its first three bars out from the centre line; the row names and
    # scores are left off so the ends read large at phone size.
    ('proof-revenge-or-justice.png', crop('rj-hero.png', (355, 835, 1345, 1345)), '#FFFFFF'),
    # The Undo List: the headline, its sentence and button, and the first row of blocks, the first one
    # signed and gold. Cut to the left side of its 1440 layout so the headline reads at phone size.
    ('proof-undo.png', crop('undo-full.png', (336, 336, 1784, 1100)), '#FFFFFF'),
    # Letters: the letter H, three real frames of the app's glyph in its blue ground, one before each
    # stroke: stroke 1 numbered on the pale letter, then 2 with the first in ink, then 3 with both.
    ('proof-letters.png', strip(['letters-h-1.png', 'letters-h-2.png', 'letters-h-3.png'],
                                (0, 440, 1460, 2010), '#E9F0F3', 280), '#E9F0F3'),
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
