# Agentic Knowledge-Base Chatbot

Internship Project Plan — Build Your First Agentic AI System

Etisalat Egypt | Internship Program 2026

## Table of Contents

- [1. Project Overview](#1-project-overview)
  - [Project Goals](#project-goals)
  - [Expected Timeline](#expected-timeline)
- [2. Learning Objectives](#2-learning-objectives)
  - [Prerequisites](#prerequisites)
- [3. Recommended Tech Stack](#3-recommended-tech-stack)
  - [Why This Stack?](#why-this-stack)
- [4. Knowledge Base Design](#4-knowledge-base-design)
  - [4.1 Domain: Etisalat Egypt](#41-domain-etisalat-egypt)
  - [4.2 Document Structure](#42-document-structure)
- [5. System Architecture](#5-system-architecture)
- [6. Project Phases](#6-project-phases)
  - [6.1 Phase 1 Core Development (1 Week)](#61-phase-1-core-development-1-week)
- [7. Deliverables & Evaluation](#7-deliverables--evaluation)
  - [Grading Rubric](#grading-rubric)
- [8. Resources & References](#8-resources--references)
  - [Essential Documentation](#essential-documentation)
  - [Learning Resources](#learning-resources)
  - [Sample Knowledge Base Sources](#sample-knowledge-base-sources)

## 1. Project Overview

This project plan guides a team of interns through building an Agentic Knowledge-Base Chatbot — an intelligent system that understands questions and retrieves accurate answers from a curated knowledge base. The project is designed for beginners with no prior experience in agentic AI systems.

The system will use a RAG (Retrieval-Augmented Generation) architecture powered by LangGraph, where documents are indexed into a vector database and retrieved contextually to generate precise responses. The knowledge base will be tailored to Etisalat Egypt's domain, making the chatbot a practical internal tool.

### Project Goals

- Build a working chatbot that answers questions based on a document knowledge base
- Learn core concepts: embeddings, vector search, RAG, and agent workflows
- Gain hands-on experience with Python, LangGraph, and modern AI tools
- Deliver a deployable prototype with a simple web or CLI interface

### Expected Timeline

The project spans 8 weeks, organized into 4 phases. Each phase builds upon the previous one, ensuring incremental learning and measurable progress.

## 2. Learning Objectives

By the end of this project, interns will be able to:

0. **Understand Agentic Systems:** Explain what agentic AI is, how RAG works, and why it matters for enterprise applications
1. **Work with Vector Databases:** Index documents, create embeddings, and perform semantic similarity search
2. **Build with LangGraph:** Design stateful agent workflows with nodes, edges, and conditional routing
3. **Integrate LLMs:** Connect to language models via APIs and craft effective prompts for grounded responses
4. **Deploy Prototypes:** Package and present a working demo with documentation

### Prerequisites

No prior AI/ML experience is required. Interns should have:

- Basic Python programming (variables, functions, classes)
- Familiarity with Git and basic command line usage
- Willingness to learn and explore new technologies

## 3. Recommended Tech Stack

The following stack has been carefully selected for beginners while remaining production-relevant. All tools are well-documented and have active community support.

| Layer | Technology | Purpose |
|---|---|---|
| Language | Python 3.10+ | Core programming language |
| Agent Framework | LangGraph | State machine workflow orchestration |
| LLM Integration | OpenAI API / Compatible | Language model for text generation |
| Embeddings | OpenAI Embeddings / SentenceTransformers | Text-to-vector conversion |
| Vector Database | ChromaDB | Document storage and similarity search |
| Web UI | Streamlit | Interactive chat interface |
| Environment | Git + venv / conda | Version control and isolation |

### Why This Stack?

- **LangGraph:** Visual, state-based workflow design — easy to understand and debug
- **ChromaDB:** Zero-config vector database that runs locally — perfect for learning
- **OpenAI/Compatible APIs:** Simple HTTP-based access to powerful language models
- **Streamlit:** Turn Python scripts into interactive web apps with minimal code

## 4. Knowledge Base Design

### 4.1 Domain: Etisalat Egypt

The chatbot's knowledge base will focus on Etisalat Egypt's products, services, and policies. This provides a realistic enterprise use case while keeping the scope manageable for an 8-week project.

Recommended document categories to include:

- Mobile Plans & Packages (prepaid, postpaid, data bundles)
- Internet Services (ADSL, fiber, 4G/5G home internet)
- Customer Support (common issues, troubleshooting steps)
- Value-Added Services (Etisalat Cash, entertainment apps, roaming)
- Company Policies (refund, cancellation, privacy)

### 4.2 Document Structure

Documents should be structured in a way that supports effective retrieval. Each document should have:

5. **Clear Title:** Descriptive heading that captures the topic (e.g., "How to Activate a Data Bundle")
6. **Structured Content:** Short paragraphs, bullet points, and numbered steps for easy parsing
7. **Metadata Tags:** Category, keywords, and last-updated date for filtering and organization
8. **Q&A Pairs:** Common questions and their answers extracted from each document

Interns will prepare 15-20 documents (approximately 5-10 pages total) covering the categories above. These can be created from publicly available information or sample data provided by mentors.

## 5. System Architecture

The system follows a RAG-based agent architecture with the following flow:

| Step | Description |
|---|---|
| 1. Query Input | User asks a question via the chat interface |
| 2. Query Understanding | The system analyzes the query intent and extracts keywords |
| 3. Document Retrieval | Relevant documents are fetched from ChromaDB using vector similarity |
| 4. Context Assembly | Retrieved documents are formatted into a context prompt |
| 5. Response Generation | The LLM generates an answer grounded in the retrieved context |
| 6. Response Delivery | The answer is presented to the user with source citations |

LangGraph orchestrates this flow as a state machine. Each step is a node, and transitions between nodes are edges. This makes the system transparent, testable, and extensible.

## 6. Project Phases

The project is divided into four phases, each with specific deliverables and learning outcomes.

### 6.1 Phase 1 Core Development (1 Week)

#### Goals

- Design the LangGraph agent workflow
- Integrate LLM for response generation
- Implement query understanding and context assembly
- Build the first working end-to-end chatbot

#### Day-by-Day Breakdown

| Focus | Key Activities |
|---|---|
| LangGraph Workflow Design | Design the state graph (nodes: understand, retrieve, generate, respond). Implement routing logic. Test with hardcoded responses. |
| LLM Integration | Connect to OpenAI-compatible API. Write prompt templates. Implement the generate node. Test response quality. |
| End-to-End Integration | Connect all nodes into full workflow. Handle edge cases (no results, ambiguous queries). Add basic logging. |

#### Deliverables

- Complete LangGraph state machine with all nodes and edges (3 Days)
- Working chatbot interface that can answer Etisalat-related questions (2 Days)
- Project documentation (Presentation) (1 Day)

## 7. Deliverables & Evaluation

Interns will be evaluated across four dimensions, emphasizing both technical growth and professional skills.

| Dimension | Weight | Criteria |
|---|---|---|
| Code Quality | 30% | Clean, documented, well-structured code with proper error handling |
| System Functionality | 50% | Chatbot correctly retrieves and answers based on the knowledge base |
| Documentation | 10% | README, code comments, architecture diagram, and test report |
| Presentation | 10% | Clear demo, engaging presentation, professional delivery |

### Grading Rubric

- **Excellent (90-100%):** All deliverables complete, clean code, creative problem-solving, strong demo
- **Good (75-89%):** All core deliverables complete, working system, adequate documentation
- **Satisfactory (60-74%):** Basic functionality works, some gaps in documentation or testing
- **Needs Improvement (<60%):** Significant functionality missing or incomplete

## 8. Resources & References

### Essential Documentation

- LangGraph Documentation: https://langchain-ai.github.io/langgraph/
- ChromaDB Documentation: https://docs.trychroma.com/
- OpenAI API Reference: https://platform.openai.com/docs/
- Streamlit Documentation: https://docs.streamlit.io/

### Learning Resources

- LangChain Academy (free online courses): https://academy.langchain.com/
- LangGraph Complete Course for Beginners – Complex AI Agents with Python
- Vector Databases Explained (YouTube): Search for Pinecone or Chroma tutorials
- Python for Data Science (if needed): https://wesmckinney.com/book/
- Top 5 Free AI APIs to Supercharge Your Apps in 2026 - DEV Community

### Sample Knowledge Base Sources

- Etisalat Egypt Official Website: https://www.etisalat.eg/
- Etisalat Cash Services and FAQ pages
- Publicly available telecom guides and tutorials
- Sample documents will be provided by mentors as starting templates

---

Good Luck!

Questions? Reach out to your mentor anytime.

Etisalat Egypt | Internship Program 2026
