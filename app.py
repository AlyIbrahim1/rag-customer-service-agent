"""
Streamlit chat UI.
Run: streamlit run app.py
"""

import base64

import streamlit as st

from graph import answer_question

LOGO = "assets/e&-logo-1.png"
FAVICON = "assets/e&-icon-square.png"
with open(LOGO, "rb") as f:
    LOGO_DATA_URI = "data:image/png;base64," + base64.b64encode(f.read()).decode()

TOPIC_QUESTIONS = {
    "DataLine": "What is DataLine and what does it offer?",
    "Emerald": "What is the Emerald plan?",
    "Hekaya Internet": "Tell me about Hekaya Internet.",
    "Hekaya Mixat": "Tell me about Hekaya Mixat.",
    "Prepaid systems": "How do e&'s prepaid systems work?",
}

st.set_page_config(page_title="e& Egypt Assistant", page_icon=FAVICON, layout="centered")

# Global look-and-feel. Brand colors (red/off-white) live in .streamlit/config.toml
# and drive Streamlit's native widgets (buttons, focus rings, spinner) automatically;
# this block only handles things config.toml can't reach: fonts, layout width, and
# the custom header/pill markup below.
st.markdown(
    """
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
    html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

    .block-container { max-width: 780px; }

    .brand-title { font-size: 1.6rem; font-weight: 800; margin: 0; color: #1A1A1A; line-height: 1.2; }
    .brand-subtitle { font-size: 0.9rem; color: #6D6E70; margin: 0.15rem 0 0 0; }

    .hero { text-align: center; padding: 2rem 1rem 1rem 1rem; }
    .hero-icon { width: 40px; height: auto; opacity: 0.85; margin-bottom: 0.75rem; }
    .hero-title { font-size: 1.4rem; font-weight: 700; margin: 0 0 0.35rem 0; color: #1A1A1A; }
    .hero-subtitle { color: #6D6E70; margin: 0 0 1.25rem 0; font-size: 0.92rem; }

    .source-pills { margin-top: 0.6rem; }
    .source-pill {
        display: inline-block;
        background: #F1EFED;
        color: #6D6E70;
        border-radius: 999px;
        padding: 0.2rem 0.7rem;
        font-size: 0.78rem;
        margin: 0.15rem 0.3rem 0.15rem 0;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

with st.sidebar:
    st.image(LOGO, width=64)
    st.markdown("**e& Egypt Assistant**")
    st.caption(
        "Ask about e&'s products and services in Egypt — DataLine, Emerald, "
        "Hekaya Internet, Hekaya Mixat, and prepaid systems."
    )
    st.divider()
    st.caption("Try asking about")
    for topic, topic_question in TOPIC_QUESTIONS.items():
        if st.button(topic, use_container_width=True):
            st.session_state.pending_question = topic_question
    st.divider()
    if st.button("New conversation", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

st.markdown(
    f"""
    <div style="display:flex; align-items:center; gap:0.85rem;">
        <img src="{LOGO_DATA_URI}" style="width:48px; height:auto; display:block;">
        <div>
            <p class="brand-title">Egypt Assistant</p>
            <p class="brand-subtitle">Answers grounded in e&'s official product documentation</p>
        </div>
    </div>
    <hr style="margin: 1rem 0 1.25rem 0; border: none; border-top: 1px solid #EAEAEA;">
    """,
    unsafe_allow_html=True,
)

if "messages" not in st.session_state:
    st.session_state.messages = []  # [{"role": "user"|"assistant", "content": str}]
if "pending_question" not in st.session_state:
    st.session_state.pending_question = None

question = st.chat_input("Ask a question...")
if st.session_state.pending_question:
    question = st.session_state.pending_question
    st.session_state.pending_question = None

chat_area = st.container(border=True)

with chat_area:
    if not st.session_state.messages and not question:
        st.markdown(
            f"""
            <div class="hero">
                <img src="{LOGO_DATA_URI}" class="hero-icon">
                <p class="hero-title">How can I help?</p>
                <p class="hero-subtitle">Ask a question below, or try one of these:</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
        chip_cols = st.columns(len(TOPIC_QUESTIONS))
        for chip_col, (topic, topic_question) in zip(chip_cols, TOPIC_QUESTIONS.items()):
            with chip_col:
                if st.button(topic, key=f"hero-{topic}", use_container_width=True):
                    st.session_state.pending_question = topic_question
    else:
        for message in st.session_state.messages:
            avatar = LOGO if message["role"] == "assistant" else None
            with st.chat_message(message["role"], avatar=avatar):
                st.markdown(message["content"])

if question:
    history = list(st.session_state.messages)
    st.session_state.messages.append({"role": "user", "content": question})

    with chat_area:
        with st.chat_message("user"):
            st.markdown(question)

        with st.chat_message("assistant", avatar=LOGO):
            with st.spinner("Thinking..."):
                result = answer_question(question, history=history)

            answer_text = result["answer"]
            st.markdown(answer_text)

            if result["sources"]:
                pills = "".join(f'<span class="source-pill">{s}</span>' for s in result["sources"])
                st.markdown(f'<div class="source-pills">{pills}</div>', unsafe_allow_html=True)
                answer_text += "\n\n**Sources:** " + ", ".join(result["sources"])

            st.session_state.messages.append({"role": "assistant", "content": answer_text})
