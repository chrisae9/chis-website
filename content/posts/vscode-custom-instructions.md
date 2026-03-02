---
title: Making VS Code Copilot Easier to Use
date: 2025-07-05
summary: How to go from idea to MVP in minutes using AI, VS Code tasks, and a template that eliminates setup friction.
category: Docs
tags: [VSCode, AI, Copilot, Workflow, Template]
---


!45[vscode copilot](/images/vscode-copilot.png)

> **Note:** I previously used Claude Sonnet 4 for Copilot workflows, but after running out of premium requests, I now use GPT-4.1 with a [custom chat mode](https://gist.github.com/burkeholland/88af0249c4b6aff3820bf37898c8bacf). For deep research and planning, I open a browser and use Gemini 2.5 Pro to gather and synthesize information before coding.

Establishing a robust AI-powered development workflow should not require extensive manual setup. This post outlines how I leverage AI, VS Code, and a custom template to streamline the process—moving beyond the era of copy-pasting code from chat windows to a fully integrated, automated workflow.



### 1. Select AI-Optimized Technology Stacks
Choose technologies that are widely adopted and well-supported by AI models. Frameworks such as React, TypeScript, Vite, and Tailwind CSS are extensively represented in AI training data, resulting in more accurate code suggestions and reduced need for manual intervention.



### 2. Automate Validation
Integrate automated testing and visual validation into your workflow. Require the AI to execute tests and capture screenshots after each change. This not only identifies most issues early, but also grounds the AI—preventing it from making overly broad changes or unintentionally breaking existing features, which can occur frequently in automated workflows.




### 3. Provide Relevant Documentation
In agent mode, the AI can search the internet for up-to-date information. When tackling a specific task, providing relevant documentation or links directly in the chat is the most effective way to ground the AI with the precise knowledge needed. This ensures the AI remains focused and accurate for the current context.



### 4. Visual Debugging with Playwright
The template includes a Playwright development server ([Microsoft Playwright MCP Server](https://github.com/microsoft/playwright-agent)), enabling interactive exploration of the application. You may instruct the AI to capture screenshots of specific interface elements, facilitating precise visual verification of changes.


## The Template: Instant Setup, Zero Fuss


To eliminate repetitive setup, I have developed a template:

[github.com/Chrisae9/copilot-template](https://github.com/Chrisae9/copilot-template)


**Features:**
- React 19, TypeScript 5.8, Vite 7, Tailwind CSS v4
- Dockerized development (no local Node.js installation required)
- Pre-configured VS Code tasks for development, testing, and production builds
- Self-updating Copilot instructions
- Integrated Playwright for visual testing


## How It Works



**1. Standardized Commands**
VS Code tasks ensure consistent command usage:
- Start development server: `docker compose --profile dev up`
- Run tests: `docker compose --profile test up`
- Build for production: `docker compose --profile build up`

**2. Self-Updating Instructions**
A custom rule enables the AI to update its own instructions file when prompted with phrases such as "remember" or "remember this." For example, stating "remember to always run tests before screenshots" results in the AI editing its own guidelines. This iterative process continuously improves the workflow.

**3. Automated Testing and Visual Verification**
The AI is required to execute tests and capture screenshots to confirm that changes are effective, significantly reducing errors and unnecessary communication. This also helps ground the AI, ensuring incremental, safe changes.

**4. Quick Continuation with 'y'**
In practice, the AI will occasionally pause and require confirmation to proceed, regardless of prior instructions. Typing a simple 'y' or 'yes' in the chat allows the workflow to continue immediately, minimizing interruptions and confusion.


## Get Started in Seconds


1. Clone: `git clone https://github.com/Chrisae9/copilot-template`
2. Open in VS Code with Copilot enabled
3. Instruct the AI: "Start development server"
4. Approve the task when prompted


---

## What’s Next?


Planned improvements include:
- Automating pull request and branch workflows for larger features
- Developing an incident management system to track and address recurring AI challenges

---


For those seeking to accelerate the journey from concept to MVP with minimal friction, this template and workflow allow the AI to handle the majority of routine development tasks efficiently.