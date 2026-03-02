---
title: Phase 10 Randomizer
date: 2021-04-22
summary: How I created a web app to generate a new rules for Phase 10.
category: Website
tags: [App, Website]
---


!65[phase10](/images/phase10.png)

[phase.chis.dev/](https://phase.chis.dev/)

## Background

I have owned the card game Phase 10 for a little over a month now and I have been able to play it a handful of times. The card game itself is really fun, but it quickly got old playing the same 10 phases each time. Therefore, I created a web app to generate the 10 phases randomly.

## Creating The Randomizer

There were many ways I could have generated each phase, but I wanted to make sure I chose a phase generator that didn’t ruin the fun. I gathered up all of the possible combinations of phases I could find from the [Phase 10 Wiki page](https://en.wikipedia.org/wiki/Phase_10) and grouped them into each phase. I removed repeats within each phase level to make the generation more random. Iterating through each phase, I selected a random card combination from the provided list until every phase was unique.

```json
example data
{
  "1": ["1 even or odd of 8"],
  "2": ["7 cards of one color"],
  "3": ["1 run of 8"],
  "4": ["2 sets of 3"],
  "5": ["1 set of 3 + 1 run of 6"],
  "6": ["1 set of 5 + 1 run of 4"],
  "7": ["1 run of 4 + 4 cards of one color"],
  "8": ["1 run of 9"],
  "9": ["1 run of 8 + 1 set of 2"],
  "10": ["1 set of 5 + 1 run of 4"]
}
```

```python
# test code
chosen = []
for n in range(10):
    while True:
        selection = random.choice(data[str(n+1)])
        if selection not in chosen:
            chosen.append(selection)
            break
for n in range(10):
    print(f'Phase {n+1}: {chosen[n]}')
```

## Why I Chose The Generator

I could have made the phases completely random by creating a list of constraints and generating random numbers for each type of combination of cards. But I chose not to do this because it would be very hard to ensure that the phases were increasing in difficulty. Since each combination of cards is unique in its way, calculating the difficulty between two combinations is not a linear task. So, I went ahead and reused the already generated phases from the wiki page which ended up being a pool of 140+ phases (about 10+ phases per level).

[Link to the randomizer](https://phase.chis.dev/)
