---
layout: distill
title: Academic Image Generation with LLM Collabration
date: 2026-01-24 10:00:00-0600
description: Personal Experience of creating publication-quality architecture diagrams using AI
tags: AI tools code image
categories: tutorials
giscus_comments: true
related_posts: true
toc:
  sidebar: left
---

Recently I was working on my paper and needed to create some illustration figures. You know, one of those architecture diagrams with boxes and arrows that show how everything flows together. The kind of figure that takes hours to draw in PowerPoint, Keynotes or Figma, where you spend more time aligning boxes than actually thinking about your research.

I really didn't want to draw it myself!

So I thought — why not try _AI image generation_? I heard Gemini's image generation model: `Gemini Banana Pro` is pretty good. Maybe it could save me some time.

(Spoiler: it did. But not in the way I initially expected.)

---

## The Failed First Attempt

My first instinct was simple: just describe what I want and let Gemini do its thing. I wrote something like "generate an evaluation pipeline with 4 phases, use boxes and arrows, make it look professional."

The result was... let's just say "creative". The flowchart looked more like abstract art than a technical diagram. Text was garbled, arrows pointed randomly, and it clearly had no idea what an "evaluation pipeline" actually meant in the context of my work.

But here's the thing — I still didn't want to draw it myself (too lazy to be a good academic person lol). This failure actually motivated me to think deeper: _why_ was Gemini failing?

---

## The Insight

After staring at those failed attempts, I realized the problem:

**Gemini doesn't understand my pipeline from a overall, hierarchical description.** It doesn't have access to my code, doesn't know the specific components, and can't infer the relationships between different parts. It's like asking someone to draw your house when they've never seen it — they'll draw **_a_** house, but not **_your_** house.

But then I thought a little bit more:

- **I'm good at high-level understanding** — I know what phases the pipeline has, I know the overall flow, I know what's important
- **I'm terrible at writing exhaustive prompts** — listing every single component, every arrow, every label is tedious and I'll miss things
- **LLMs can read my code in details** — SOTA LLMs can understand every function, every data flow, every detail in the code pretty well nowadays
- **Gemini is good at generating images** — but only when given precise instructions

The solution became obvious: **use LLMs to bridge the gap**. I provide the high-level structure, LLM (I use Claude Opus4.5, one of the SOTA models for now) reads my code and generates a detailed prompt, then Gemini creates the image.

Let me show you exactly how this worked.

---

## Step 1: Asking Claude for a Detailed Prompt

I started by giving Claude Opus4.5 the context about my pipeline. Claude had already seen my code before, so it understood the implementation details. Here's what I asked:

{% details Click to see the prompt %}
I think now you are pretty clear about the evaluation pipeline. Now I want to create an illustrative image to show in the paper. It should show the readers the architecture, and let the reader quickly know how the pipeline work, and the image should highlight the contribution and special parts of the pipeline (to point out our innovation).

Now please give me a professional, informative, rigorous and high-quality prompt for the image generation model: Nano Banana Pro from google to create a good illustrative image. This image will be shown on the top of the corresponding page of the evaluation pipeline section. It will take two columns on the top of that page, and then also give a detailed, rigorous and professional caption for the image. It should concisely describe the whole pipeline and highlight the important parts for the reader to quickly understand the pipeline. I will copy your prompt to that model directly and then see what image it generate.
{% enddetails %}

Notice how my prompt is high-level — I'm describing _what_ I want, not _how_ to draw it. I mentioned there are phases, I mentioned highlighting contributions, but I didn't list every single component. That's Claude's job.

Claude came back with this detailed prompt for Gemini:

{% details Click to see the prompt %}
Create a professional academic figure showing a 4-phase evaluation pipeline for temporal knowledge leakage detection in LLM predictions. The figure should be horizontal, suitable for a two-column academic paper layout.

Layout (left to right flow):

- Start with INPUT box on the left containing: "Rationale R", "Reference time t_ref", "Task context"

PHASE 1 (Claim Extraction):

- Box labeled "Phase 1: Claim Extraction"
- Show rationale being decomposed into multiple small boxes representing claims
- Each claim box has a category label tag (A1, A2, A3, A4, A5, B1, B2)
- Output arrow splits into TWO parallel paths

PARALLEL PROCESSING (Phase 2 and Phase 3 run simultaneously):

- Use dashed vertical line or visual indicator showing these run in parallel

PHASE 2 (upper parallel branch):

- Box labeled "Phase 2: Shapley Computation"
- Show mathematical symbol $$ \phi_1, \phi_2, \ldots, \phi_n $$
- Small icon suggesting Monte Carlo sampling
- Output: "Shapley values $$ \{\phi_i\} $$"

PHASE 3 (lower parallel branch):

- Box labeled "Phase 3: Leakage Detection"
- IMPORTANT: Show a decision tree or branching logic:
  - A4/A5 → "Always Leaked" (marked with red/warning color, NO search icon)
  - B1/B2 → "Never Leaked" (marked with green/safe color, NO search icon)
  - A1/A2/A3 → "Search Required" (with search/magnifying glass icon)
- Output: "Leakage indicators $$ \{\ell_i\} $$"

PHASE 4 (Metrics):

- Box labeled "Phase 4: Metrics Aggregation"
- Two arrows from Phase 2 and Phase 3 converge here
- Show formulas or text: "OLR", "Shapley-DCLR"
- Output box on right: "Leakage Report" with metrics

Visual style:

- Clean, minimalist academic style with light colors
- Use arrows to show data flow
- Highlight the parallel execution and category-based optimization as key innovations
- Use consistent color coding: blue for processing phases, green for valid/safe, red/orange for leaked/warning
- Professional typography suitable for academic publication
- White or light gray background
  {% enddetails %}

See how detailed this is? Claude specified exact component names from my code, the mathematical notation, the color coding, etc. This is exactly the kind of exhaustive prompt I would never write myself.

---

## The First Generated Image

I copied Claude's prompt directly to Gemini Banana Pro and got this:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blog/gemini-figures/pipeline_v1.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Version 1: The first attempt. Overall structure is there, but there are several issues...
</div>

Not bad for a first attempt! The overall flow is there, the parallel processing is shown, and the color coding looks reasonable. But when I looked closely, there were several problems:

- **Naming issue**: Phase 4 shows "Shapley-based Dynamic Claims Leakage Rate" which is incorrect
- **Equation issue**: The DCLR formula only shows the numerator, missing the denominator
- **Phase 1 verbosity**: Claims are labeled as "Claim 1", "Claim 2", etc. with confusing category assignments
- **Output verbosity**: The output box has unnecessary text like "other relevant aggregated metrics"
- **Informal tone**: The callout says "highly efficient!" which is too promotional for an academic paper

---

## Step 2: Claude Analyzes the Problems

As there's still some problems in the iamge, instead of writing the problems manually in the prompt, I showed this image to Claude and asked it to analyze with a critical eye:

{% details Click to see the prompt %}
Please carefully read it in a professional and rigorous view, think deeply about our pipeline, and then give out some advice to improve this pipeline image. You should form all the advice and modification into a prompt and then I will copy it to the image generation model to generate a refined image.
{% enddetails %}

Claude came back with a detailed analysis. Here's what it found:

**What works well:**

- Overall left-to-right flow is clear
- Parallel processing indicator between Phase 2 and 3
- Category-based branching in Phase 3 with color coding
- The efficiency callout for skipping search

**Issues that need fixing:**

| Issue          | Problem                                                                  | Fix                                                          |
| -------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Phase 4 naming | "Shapley-based Dynamic Claims Leakage Rate" is WRONG                     | Should be "Decision-Critical Leakage Rate"                   |
| DCLR formula   | Only showing right hand side is incomplete                               | Should show full formula with denominator and absolute value |
| Phase 1 claims | Claim numbering is confusing (shows Claim 6, 7, 8 with wrong categories) | Use cleaner representation: $ c_1, c_2, \ldots, c_n $        |
| Missing detail | Phase 3 doesn't show comparison with $ t\_{ref} $                        | Add "$ \tau(c) > t\_{ref} $?" for A1-A3 branch               |

This is exactly why I use Claude for this — I might have noticed one or two issues, but Claude caught things like the incorrect metric naming and the incomplete formula that I could have easily missed.

Claude then generated a refinement prompt:

{% details Click to see the prompt %}

Refine this academic figure for a temporal leakage evaluation pipeline. Make the following specific corrections and improvements:

**CORRECTIONS (CRITICAL):**

1. In Phase 4, change "Shapley-based Dynamic Claims Leakage Rate" to "Shapley-weighted Decision-Critical Leakage Rate (Shapley-DCLR)"
2. Fix the Shapley-DCLR formula to show the COMPLETE formula: $ \text{DCLR} = \frac{\sum_i \lvert\phi_i\rvert \cdot \ell_i}{\sum_i \lvert\phi_i\rvert} $. It MUST include the denominator and absolute values
3. Change the informal callout "40-80% claims skip search, highly efficient!" to a more academic tone: "40-80% of claims determined without search"

**IMPROVEMENTS:**

4. In Phase 1, simplify the claim representation: show rationale $ R $ being decomposed into claims $ c_1, c_2, \ldots, c_n $, each with a single category tag (use colors: orange for A1-A3, red for A4-A5, green for B1-B2)
5. In Phase 3, for the "SEARCH REQUIRED" branch (A1, A2, A3), add a small label showing the comparison: "$ \tau(c) > t\_{ref} $?" to indicate we're comparing determination date against reference time
6. In the OUTPUT box, remove "other relevant aggregated metrics" - just show "OLR: X%" and "Shapley-DCLR: Y%"
7. Make the parallel processing text more readable - either horizontal or use a cleaner vertical label
8. Use consistent academic styling throughout - no exclamation marks, promotional language, or informal callouts

**KEEP:**

- The overall left-to-right flow structure
- The phase box styling and colors
- The three-way branching in Phase 3 (A4/A5 → Always Leaked, A1-A3 → Search, B1/B2 → Never Leaked)
- The Monte Carlo sampling indicator in Phase 2
- The color scheme (red for leaked, green for safe, blue for processing)

**Style:** Clean, minimalist, professional academic figure suitable for a top-tier venue. White background, clear typography.

{% enddetails %}

---

## The Second Generated Image

I fed this refinement prompt to Gemini and got:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blog/gemini-figures/pipeline_v2.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Version 2: Better! The naming is fixed, the callout is more academic, but there are still issues with the formula...
</div>

Better! But still not perfect. Here's what improved and what still needs work:

**Fixed:**

- Phase 4 naming corrected to "Decision-Critical Leakage Rate"
- Added $ \tau(c) > t\_{ref} $ comparison in Phase 3
- Callout now uses academic tone
- Output box is cleaner

**Still problematic:**

- Phase 1 claims still have duplicate numbering ($ c_3 $, $ c_6 $, $ c_7 $ appear twice)
- DCLR formula still incomplete (missing denominator)
- "NO search icon" text is redundant

---

## Step 3: One More Round

I showed this to Claude again and asked for another analysis:

{% details Click to see the prompt %}
This is the modified version, let's do what we just did one more time, check every details in the image with your understanding of the pipeline, and then check if the image fit your rigorous, professional high-standard requirements. Then give me a refine prompt for the model to modify the image it just generated.

Also I noticed that in phase 4, the equation is not complete. It use the words as the left hand side of the equation, which is not good looking. Please ask the model to write the complete equation.
{% enddetails %}

Claude found more issues:

**Phase 1 - Claim Extraction:**

- ❌ Claim numbering is still problematic: $ c_3 $ appears twice, $ c_6 $ appears twice, $ c_7 $ appears twice
- Should be $ c_1, c_2, c_3, c_4, c_5, c_6, c_7 $ each appearing exactly ONCE

**Phase 2 - Shapley Computation:**

- ✓ $ \phi_1, \phi_2, \ldots, \phi_n $ shown correctly
- ✓ Monte Carlo Sampling indicated
- ✓ Clean and correct

**Phase 3 - Leakage Detection:**

- ✓ $ \tau(c) > t\_{ref} $? added for A1-A3 branch (good!)
- ✓ Callout is now academic tone
- ❌ "NO search icon" text is redundant

**Phase 4 - Metrics Aggregation:**

- ✓ Name corrected to "Decision-Critical Leakage Rate"
- ❌ CRITICAL: Shapley-DCLR formula is STILL INCOMPLETE - shows $ \sum(\phi_i \cdot \ell_i) $ but missing denominator $ \sum\lvert\phi_i\rvert $
- ❌ Using words as left-hand side of equation looks unprofessional

Claude generated another refinement prompt:

{% details Click to see the prompt %}

Further refine this academic figure with the following specific corrections:

**CRITICAL FORMULA CORRECTIONS IN PHASE 4:**

1. The Shapley-DCLR formula is INCOMPLETE. Replace the current formula with the COMPLETE equation:

$$ \text{DCLR} = \frac{\sum_i \lvert\phi_i\rvert \cdot \ell_i}{\sum_i \lvert\phi_i\rvert} $$

Show this as a proper fraction with numerator on top and denominator on bottom. The absolute value bars $ \lvert\phi_i\rvert $ are essential.

2. For OLR, show the complete equation:

$$ \text{OLR} = \frac{1}{n} \sum_i \ell_i $$

3. Do NOT use words like "OLR (Overall Leakage Rate) =" as the left-hand side. Use proper mathematical notation. The metric names can be shown as labels above or beside the equations, but the equations themselves should be complete mathematical expressions.

**PHASE 1 CORRECTIONS:**

4. Fix the claim numbering - each claim should appear exactly ONCE. Show: $ c_1 $(A1), $ c_2 $(A2), $ c_3 $(A3), $ c_4 $(A4), $ c_5 $(A5), $ c_6 $(B1), $ c_7 $(B2). Arrange them in a cleaner grid or flow from $ R $, with no duplicate claim numbers.

**PHASE 3 CORRECTIONS:**

5. Remove the redundant "NO search icon" text under "ALWAYS LEAKED" and "NEVER LEAKED" boxes. The visual already clearly shows no magnifying glass - the text is unnecessary.

**KEEP EVERYTHING ELSE:**

- The overall layout and flow
- The parallel processing indicator
- The color scheme (blue phases, red for leaked, green for safe)
- The $ \tau(c) > t\_{ref} $? label on the A1-A3 branch
- The "40-80% of claims determined without search" callout
- The clean OUTPUT box

**Style:** Ensure all mathematical notation is crisp, properly formatted, and publication-ready for a top-tier venue.

{% enddetails %}

---

## The Final Image

Finally we got this version, which looks good to me:

<div class="row mt-3">
    <div class="col-sm mt-3 mt-md-0">
        {% include figure.liquid loading="eager" path="assets/img/blog/gemini-figures/pipeline_v3.png" class="img-fluid rounded z-depth-1" zoomable=true %}
    </div>
</div>
<div class="caption">
    Version 3: The final result. Clean, accurate, publication-ready.
</div>

I showed this to Claude and asked if it was ready:

{% details Click to see the prompt %}
What about this version, do you think we need further improvement? Or this one already meets your standard for our paper (professional, rigorous, and high-quality). Give me your reason.
{% enddetails %}

Claude's response: **"This version meets the standards for a professional paper."**

Here's Claude's final assessment:

| Element        | Status | Details                                                                                                      |
| -------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| Phase 1        | ✓      | $ c_1 $ through $ c_7 $ each appears exactly once with correct category tags                                 |
| Phase 2        | ✓      | $ \phi_1, \phi_2, \ldots, \phi_n $ with Monte Carlo Sampling indicator                                       |
| Phase 3        | ✓      | Clean three-way branching, $ \tau(c) > t\_{ref} $? shown, no redundant text                                  |
| Phase 4 - OLR  | ✓      | Complete formula: $ \text{OLR} = \frac{1}{n} \sum_i \ell_i $                                                 |
| Phase 4 - DCLR | ✓      | Complete formula: $ \text{DCLR} = \frac{\sum_i \lvert\phi_i\rvert \cdot \ell_i}{\sum_i \lvert\phi_i\rvert} $ |
| Layout         | ✓      | Clear left-to-right flow, parallel processing indicated                                                      |
| Style          | ✓      | Clean, professional, no informal callouts                                                                    |

**Why it meets publication standards:**

- **Mathematical Rigor**: Both formulas are now complete and correctly formatted with proper fraction notation
- **Visual Clarity**: The pipeline flow is immediately understandable — a reader can grasp the four phases and their relationships at a glance
- **Technical Accuracy**: The category-based branching in Phase 3 correctly shows the key contribution
- **Professional Appearance**: Clean color scheme, consistent typography, no promotional language
- **Self-Contained**: The figure tells the complete story without requiring the reader to reference the text

---

## What I Learned

This whole process took about 40 minutes and 3 iterations. Compare that to multiple hours I would have spent manually drawing it in PowerPoint, Keynotes or Figma.

But more importantly, I think here's why this workflow actually works:

> **The key insight**: Humans are good at high-level thinking — understanding the overall structure, knowing what's important, deciding what looks "right." AI models are good at details — reading code, extracting every component, writing exhaustive prompts.
> {: .block-tip }

The workflow leverages each participant's strengths:

| Task                                        | Best Done By        |
| ------------------------------------------- | ------------------- |
| Understanding overall structure             | Me                  |
| Extracting implementation details from code | Claude Opus4.5      |
| Synthesizing into comprehensive prompt      | Claude Opus4.5      |
| Generating visual output                    | Gemini Banana Pro   |
| Identifying visual errors                   | Me + Claude Opus4.5 |
| Making final quality decisions              | Me                  |

You're not asking any single agent to do everything. You're orchestrating a collaboration where each participant does what they're best at.

---

## Try It Yourself

If you want to try this for your own paper figures:

1. **Give Claude your code and high-level structure** — You don't need to write a detailed prompt. Just say the hierarchical overview of your architecture or pipeline like "there are 4 phases" or "the agent has these components." Claude will read your code and fill in the details.

2. **Feed LLM's prompt to Image Generator** — Copy it directly. Don't edit it (unless you spot something obviously wrong).

3. **Show the result back to the LLM** — Ask it to analyze critically. Tell it to find _ALL_ errors, not just the obvious ones.

4. **Iterate 2-3 times** — In my experience, it usually converges within several iterations (no more than 5).

5. **Do a final quality check** — Ask LLM to compare against high-quality figures from top venues.

The first time might feel slow as you figure out the workflow. But once you have it down, you can generate publication-quality figures much faster than drawing them yourself.

And honestly? The figures often end up better than what I would have drawn manually, because Claude catches details and inconsistencies that I would have missed.

---

## Resources

- [Gemini Image Generation](https://gemini.google.com)
- [Claude Opus4.5](https://www.anthropic.com/news/claude-opus-4-5)
- [Cursor IDE](https://cursor.com/agents)
