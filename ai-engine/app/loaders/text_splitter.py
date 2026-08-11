from langchain_text_splitters import RecursiveCharacterTextSplitter

def get_text_splitter(chunk_size=1000, chunk_overlap=200):
    """
    Returns a RecursiveCharacterTextSplitter configured for standard document chunking.
    It splits by paragraph, then sentences, then words to keep semantic meaning intact.
    """
    return RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        separators=["\n\n", "\n", ".", " ", ""]
    )
