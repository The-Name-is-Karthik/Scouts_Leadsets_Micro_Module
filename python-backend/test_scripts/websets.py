from exa_py import Exa
from dotenv import load_dotenv
from exa_py.websets.types import CreateWebsetParameters, CreateEnrichmentParameters

import os

load_dotenv()
exa = Exa(os.getenv('EXA_API_KEY'))

# Create a Webset with search and enrichments
webset = exa.websets.create(
    params=CreateWebsetParameters(
        search={
            "query": "Find APAC DTC beauty brands (sensitive skin) in AU/NZ asking for creators or before/after proof; discussing budget tiers and UGC briefs; Shopify preferred.",

            "count": 2
        },
        # enrichments=[
        #     CreateEnrichmentParameters(
        #         description="LinkedIn profile of VP of Engineering or related role",
        #         format="text",
        #     ),
        # ],
    )
)

print(f"Webset created with ID: {webset.id}")

# Wait until Webset completes processing
webset = exa.websets.wait_until_idle(webset.id)

# Retrieve Webset Items
items = exa.websets.items.list(webset_id=webset.id)
for item in items.data:
    print(f"Item: {item.model_dump_json(indent=2)}")