"""
Streamlit chat UI.
Run: streamlit run app.py
"""

import streamlit as st

from graph import answer_question

st.set_page_config(page_title="e& Egypt Assistant", page_icon="🔴")

# e& brand red (#EE3423) applied to the wordmark; theme colors for the rest
# of the UI (buttons, input focus, spinner) live in .streamlit/config.toml
st.markdown(
    """
    <style>
    .brand-title { font-size: 2.25rem; font-weight: 800; margin-bottom: 0; }
    .brand-title .brand-mark { color: #EE3423; }
    </style>
    <div class="brand-title"><span class="brand-mark">e&</span> Egypt Assistant</div>
    """,
    unsafe_allow_html=True,
)
st.caption("Ask about DataLine, Emerald, Hekaya Internet, Hekaya Mixat, or prepaid systems.")

if "messages" not in st.session_state:
    st.session_state.messages = []  # [{"role": "user"|"assistant", "content": str}]

for message in st.session_state.messages:
    avatar = "🔴" if message["role"] == "assistant" else None
    with st.chat_message(message["role"], avatar=avatar):
        st.markdown(message["content"])

question = st.chat_input("Ask a question...")
if question:
    st.session_state.messages.append({"role": "user", "content": question})
    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant", avatar="🔴"):
        with st.spinner("Thinking..."):
            result = answer_question(question)

        answer_text = result["answer"]
        if result["sources"]:
            answer_text += "\n\n**Sources:** " + ", ".join(result["sources"])

        st.markdown(answer_text)
        st.session_state.messages.append({"role": "assistant", "content": answer_text})