---
title: "Making a combo randomizer part 01"
description: "An introduction to the OoTMM project"
slug: ootmm-part-01
created_at: 2023-08-19
tags: [Nintendo-64, MIPS, OoTMM]
---

For almost 5 years now, I have been working on a project called [OoTMM](https://ootmm.com) - the **Ocarina of Time & Majora's Mask Combo Randomizer**.

But what is a combo randomizer? In fact, what is a video game randomizer at all?

## Randomizers

At its core, a randomizer is a program that takes a video game and shuffles the position of some of it's elements, typically items or power-ups, to create a new experience for the player.  
We call the unique, randomized version of the game that is thus produced a *seed*<note>Technically the seed is what was given as an input to the pseudo-random number generator that was used during the randomization, but the analogy stuck.</note>.  

Typically, unless disabled by the user, a proper randomizer ensures that it is still possible to complete the game, even with the shuffled elements. The algorithm and set of rules that enforce this is called *logic* in the randomizer jargon.
Conversely, a seed where this has been disabled is called a *no-logic seed*.

Some games are more suited to randomization than others. Typically, games that have both pretty open environments where progression is gated by acquiring items or abilities are very good candidates. On the other hand, games that are either very open with little gating, or very linear with little opportunities to use items or abilities outside of their intended context are poor candidates.

Some well-known games or series that are commonly randomized include:
- *The Legend of Zelda* series, both the 2D and 3D entries
- *Metroid* series, especially *Super Metroid*
- *Castlevania* series (the metroidvania-style ones)

Perhaps the most popular game to be randomized is *The Legend of Zelda: A Link to the Past*<note>Also known as ALttP or Zelda 3.</note>. The [ALttP Randomizer](https://alttpr.com) has been around for about a decade, and still has regular updates and a very active playerbase.

<img src="title_oot.png" alt="Screenshot of the title screen of 'The Legend of Zelda: Ocarina of Time'"/>
<img src="title_mm.png" alt="Screenshot of the title screen of 'The Legend of Zelda: Majora's Mask'"/>
