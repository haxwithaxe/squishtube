# SquishTube
A Tampermonkey userscript to squish YouTube videos into the top left of the window and optionally resized the video to fit better in reduced size windows.

* Operates only on `youtube.com/watch`.
* Works with autoplay and between sessions (using localStorage to persist settings).

## Controls
* The `Squish` button forces the video into the top-left of the page.
* The `+` button scales the video larger.
* The `-` button scales the video smaller.
* The `Reset` button puts everything back to stock.

# Notes
* The controls aren't being scaled so they can wander off sometimes.

# Examples

## Original state
![Normal](/../images/original.png?raw=true)

## Over-shunk and squished
![Over-shrunk](/../images/squished-and-overshunk.png?raw=true)

## Just right
![Just Right](/../images/just-right.png?raw=true)
