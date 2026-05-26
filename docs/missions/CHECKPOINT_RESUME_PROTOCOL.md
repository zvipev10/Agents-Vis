# Checkpoint and Resume Protocol

This document defines the durable handoff flow for long-running Hermes missions so work can stop cleanly and restart from the latest verified state.

## Purpose

The goal is to prevent mission progress from living only in a transient agent session. Every meaningful stop should leave behind a resumable checkpoint that captures what is already done, what was verified, and what comes next.

## When to create a checkpoint

Create a checkpoint whenever any of these happen:
- a major mission gate is completed
- a task or review loop finishes
- the run is about to stop because of iteration, time, or context pressure
- the team is interrupted by a blocker or user question that pauses execution
- the mission reaches a handoff point between implementation phases

## Required checkpoint contents

A checkpoint should always include:
- mission name
- checkpoint timestamp
- active session or run identifier, if known
- worktree or repo path, if relevant
- current phase / gate
- completed work
- verified work
- files changed or created
- remaining work
- known blockers or risks
- tests already run and their results
- the exact next step to resume from
- any decisions that should not be re-litigated on resume

## File naming convention

Use one durable checkpoint file per mission in `docs/missions/`.

Recommended pattern:
- `docs/missions/<MISSION_NAME>_CHECKPOINT.md`

If the mission has multiple checkpoints, keep the latest state in that file and archive prior notes in the mission log or plan if needed.

## Resume procedure

When resuming a mission:
1. Read the latest checkpoint first.
2. Rebuild the current todo list from that checkpoint.
3. Continue from the next unchecked gate, not from the beginning.
4. Re-run the verification that was last incomplete.
5. If the codebase or worktree no longer matches the checkpoint, treat the checkpoint as the source of truth and reconcile explicitly.

## Resume decision rule

If the latest checkpoint says a step was already completed and verified, do not redo it unless the underlying files changed.

If the latest checkpoint says a step was started but not verified, repeat that step and verify it again before moving forward.

## Handoff standard

Every meaningful mission update should end with one of these states:
- checkpointed and resumable
- blocked with a specific next action
- complete and verified

That way a future run can restart from a concrete artifact instead of reconstructing context from memory alone.
