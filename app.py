"""
Streamlit chat UI.
Run: streamlit run app.py
"""

import streamlit as st

from graph import answer_question

st.set_page_config(page_title="Etisalat Egypt Assistant", page_icon="📶")
st.title("Etisalat Egypt Assistant")
st.caption("Ask about DataLine, Emerald, Hekaya Internet, Hekaya Mixat, or prepaid systems.")

if "messages" not in st.session_state:
    st.session_state.messages = []  # [{"role": "user"|"assistant", "content": str}]

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

question = st.chat_input("Ask a question...")
if question:
    st.session_state.messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):
        with st.spinner("Thinking..."):
            result = answer_question(question)

        answer_text = result["answer"]
        if result["sources"]:
            answer_text += "\n\n**Sources:** " + ", ".join(result["sources"])

        st.markdown(answer_text)
        st.session_state.messages.append({"role": "assistant", "content": answer_text})