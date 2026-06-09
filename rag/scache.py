import redis
from langcache import LangCache
from envkeys import cache_id, api_key


if not cache_id or not api_key:
    print("ERROR: Missing credentials!")
    exit()

#resp1 = """Conditional probability is a measure of the probability of an event (say, A) given that another event (B) has already occurred. It is denoted by P(A | B), which reads \"the probability of A given that B’s occurrence is known.\"\n
#    \nTo put it into context, let's use an example from the document. If P(Cavity) = 0.04, it means that there's a 4% chance at any time that you have a cavity. However, if you have a toothache, the probability of having a cavity increases. This is represented as P(Cavity | Toothache) = 0.8, meaning \"If you have a toothache, there’s an 80% chance you have a cavity.\"\n\n
#    Another important concept in conditional probability is the chain rule, which states P(A ^ B) = P(A | B) P(B). This rule is useful in calculating the probability of compound events.
#    \n\nIn some cases, conditional probabilities can be interpreted as \"soft\" or \"fuzzy\" versions of logical implications. For instance, P(B|A) = 0.95 can be seen as a \"soft fuzzy\" version of A implies B."""


def set_cache_entry(prompt: str, response: str, buddy_id: str) -> dict:

    
    try:
        # open a Redis LangCache connection
        with LangCache(
            server_url="https://aws-us-east-1.langcache.redis.io",
            cache_id=cache_id,
            api_key=api_key
        ) as lang_cache:
            
            res = lang_cache.set(
                prompt=prompt,
                response=response,
                attributes={"buddy_id": buddy_id}
            )

            return {"success": True}
        
    except Exception as e:
        print(f"Cache write error: {e}")
        return {"success": False}
    

def search_cache(prompt: str, buddy_id: str) -> dict:


    try:
        with LangCache(
            server_url="https://aws-us-east-1.langcache.redis.io",
            cache_id=cache_id,
            api_key=api_key
        ) as lang_cache:
            
            res = lang_cache.search(prompt=prompt, attributes={"buddy_id": buddy_id})

            if res.data:
                return {"success": True, "response": res}
            else:
                return {"success": False, "response": None}
            
    except Exception as e:
        print(f"Cache read error: {e}")
        return {"success": False, "response": None, "error": True}
    


# driver code
#result = set_cache_entry(prompt="What is the main topic", response=resp1, buddy_id="1")
#print(result)

#result = search_cache(prompt="Explain the main topic", buddy_id="1")
#print(result)

# now legitimate case
#result = set_cache_entry(prompt="What is conditional probability", response=resp1, buddy_id="1")
#print(result)

#result = search_cache(prompt="How does conditional probability arise?", buddy_id="1")
#print(result["response"].data[0].response)
# think this works

            

