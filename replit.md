# FEA Problem Solver

## Overview

This is a Flask-based web application that solves Finite Element Analysis (FEA) problems using AI language models. The application leverages Google's Gemini AI to provide numerical solutions to engineering problems, with a clean web interface for user interaction.

## System Architecture

The application follows a simple web application architecture:

- **Frontend**: HTML templates with CSS styling and JavaScript for user interaction
- **Backend**: Flask web framework handling HTTP requests
- **AI Integration**: LangGraph workflow orchestrating LLM calls to Google Gemini
- **Deployment**: Gunicorn WSGI server for production deployment

## Key Components

### Flask Application (`app.py`, `main.py`)
- **Purpose**: Web server handling user requests and responses
- **Key Features**: 
  - Route handling for problem submission
  - Number extraction utilities for parsing AI responses
  - Session management and error handling
- **Architecture Decision**: Flask chosen for its simplicity and rapid development capabilities

### FEA Solver (`fea_solver.py`)
- **Purpose**: Core AI-powered problem solving logic
- **Architecture**: Uses LangGraph StateGraph for workflow orchestration
- **LLM Integration**: Google Gemini 1.5-flash model for FEA problem solving
- **State Management**: TypedDict-based state for maintaining problem and response data
- **Design Choice**: LangGraph provides structured workflow management over simple API calls

### Frontend Templates (`templates/index.html`)
- **Architecture**: Single-page application with dynamic content loading
- **UI Framework**: Vanilla JavaScript with Font Awesome icons
- **Responsive Design**: Mobile-first approach with flexbox layouts
- **User Experience**: Example problems, auto-resizing text areas, and real-time feedback

### Styling (`static/css/style.css`)
- **Theme**: Dark theme with orange accents for professional engineering look
- **Design System**: CSS custom properties for consistent theming
- **Layout**: Flexbox-based responsive design

## Data Flow

1. **User Input**: User enters FEA problem description in web interface
2. **Request Processing**: Flask route receives POST request with problem data
3. **AI Processing**: FEASolver creates LangGraph workflow state and invokes Gemini model
4. **Response Generation**: AI model returns numerical solution
5. **Result Display**: Frontend displays formatted results to user

## External Dependencies

### AI Services
- **Google Gemini API**: Primary LLM for FEA problem solving
- **Requirement**: GOOGLE_API_KEY environment variable
- **Model**: gemini-1.5-flash for fast response times

### Python Packages
- **Flask**: Web framework (v3.1.1+)
- **LangChain**: LLM orchestration framework (v0.3.25+)
- **LangGraph**: Workflow management (v0.4.8+)
- **Gunicorn**: Production WSGI server (v23.0.0+)

### Infrastructure
- **Database**: PostgreSQL support configured (not currently used)
- **Deployment**: Replit autoscale deployment target

## Deployment Strategy

### Development Environment
- **Runtime**: Python 3.11 with Nix package management
- **Local Server**: Flask development server on port 5000
- **Hot Reload**: Gunicorn with reload flag for development

### Production Deployment
- **WSGI Server**: Gunicorn with autoscale deployment
- **Port Configuration**: Internal port 5000, external port 80
- **Process Management**: Parallel workflow execution for dependency installation

### Environment Configuration
- **Required Variables**: GOOGLE_API_KEY for AI functionality
- **Optional Variables**: SESSION_SECRET for Flask sessions
- **Package Management**: UV for fast Python package installation

## Changelog

- June 16, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.