---
title: "Temporal Leakage in LLM Backtesting: Measurement, Validation, and Adjusted Scores"
type: Invited Talk
venue: College of Cyber Security, Jinan University
location: Guangzhou, China
date: 2026-09-02
lead_image:
  path: talks/jinan-podium.jpg
  caption: Presenting on the Panyu campus
description: >
  I delivered an invited research talk in the 2026 Academic Lecture Series of the College of
  Cyber Security at Jinan University, presenting my work on temporal leakage in LLM
  backtesting — how pretrained models silently "read the future," how to measure the
  contamination, and how to eliminate it — to faculty and graduate students, followed by an
  extended Q&A.
details: >
  The talk treated temporal leakage at two levels. At the level of an individual prediction,
  I presented tools that measure how much leaked evidence actually drives a forecast, filter
  leaked claims at inference time, and train the model to reason only from pre-cutoff
  information. At the level of the backtest score, I showed that the usual pre/post
  contamination check is uninformative — legitimate recency effects reproduce the leakage
  signature — and that one external reference, such as a known training cutoff or a matched
  clean control, restores measurement and yields a leakage-adjusted score. The 90-minute
  session ran in person on the Panyu campus with a parallel online audience, and closed with
  an extended Q&A on evaluation practices for deployed forecasting systems.
more_images:
  - path: talks/jinan-college.jpg
    caption: At the College of Cyber Security
  - path: talks/jinan-gate.jpg
    caption: Jinan University campus gate
---
