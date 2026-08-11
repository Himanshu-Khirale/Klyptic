from langchain_huggingface import HuggingFaceEmbeddings

class EmbeddingsManager:
    _instance = None

    @classmethod
    def get_embeddings(cls):
        if cls._instance is None:
            # We use a highly efficient, free, and local embeddings model
            # "all-MiniLM-L6-v2" generates 384-dimensional vectors.
            cls._instance = HuggingFaceEmbeddings(
                model_name="all-MiniLM-L6-v2",
                model_kwargs={'device': 'cpu'}, # Use CPU by default for broader compatibility
                encode_kwargs={'normalize_embeddings': True}
            )
        return cls._instance

def get_embeddings():
    return EmbeddingsManager.get_embeddings()
