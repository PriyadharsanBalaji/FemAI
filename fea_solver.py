import os
from typing import TypedDict
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import START, END, StateGraph
from langchain_google_genai import ChatGoogleGenerativeAI


class State(TypedDict):
    problem: str
    response_gem: str

class FEASolver:
    def __init__(self):
       
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        
        if not self.google_api_key:
            print(f"Google API Key present: {bool(self.google_api_key)}")
            raise ValueError("Missing API key. Please set GOOGLE_API_KEY environment variable.")
        
        
        self._setup_workflow()
    
    def _setup_workflow(self):
        """Setup the LangGraph workflow"""
        workflow = StateGraph(State)
        workflow.add_node("feallmsolvernode", self._feallmsolver)
        workflow.add_edge(START, "feallmsolvernode")
        workflow.add_edge("feallmsolvernode", END)
        self.app = workflow.compile()
    
    def _feallmsolver(self, state: State) -> State:
        """FEA LLM solver function - unchanged from original code"""
        print("Entering gemini llm chain")
        stateprompt = ChatPromptTemplate.from_template(
            "You are a FEA Engineer. Solve the given finite element analysis problem and provide ONLY the final numerical answer. "
            "Do not show any calculations, formulas, or explanations. "
            "Just return the final number with 5 decimal places. "
            "If there are multiple sub-questions, answer only the first one. "
            "Format: Return only the number (e.g., 22.36068). "
            "Problem: {Description}"
        )
        
        llm1 = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )
        chain1 = stateprompt | llm1
        initial_gemini_response = chain1.invoke({"Description": state["problem"]})

        
        return {
            "problem": state["problem"],
            "response_gem": initial_gemini_response.content
        }
    
    def solve(self, problem: str) -> dict:
        """Solve FEA problem using the workflow"""
        final_result = self.app.invoke({"problem": problem})
        return final_result
