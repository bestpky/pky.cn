---
title: useContext+useReducer+TS的状态管理
date: 2022-03-24
description: useContext+useReducer+TS的状态管理
tags:
  - react状态管理
  - useContext
  - useReducer
  - Typescript
---

## 前言

谈到 React 状态管理，你可能会想到很多知名方案，如`Redux`、`Mobx`等，但其实很多时候需要那么复杂么？
React 在`hooks`之后官方的 API 就有实现状态管理的方案，那就是`useContext+useRedux`，十分轻量化，本篇介绍在 Typescript 中的使用，纯属干货。
