import httpx
from app.core.config import settings


async def chat_with_ai(prompt: str, context: str = "") -> str:
    """调用国内AI API（智谱GLM-4示例）"""
    messages = [
        {
            "role": "system",
            "content": "你是OPC决策工作台AI助手，帮助分析数据。简洁、准确、专业。",
        },
    ]
    if context:
        messages.append(
            {"role": "user", "content": f"当前数据：{context}\n\n问题：{prompt}"}
        )
    else:
        messages.append({"role": "user", "content": prompt})

    # 智谱 GLM-4 API
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(
            settings.AI_API_URL,
            headers={"Authorization": f"Bearer {settings.AI_API_KEY}"},
            json={
                "model": settings.AI_MODEL,
                "messages": messages,
                "temperature": 0.7,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def generate_data_insights(data_context: str) -> list[str]:
    """生成数据洞察"""
    prompt = f"基于以下数据生成3条关键洞察，每条一行：{data_context}"
    result = await chat_with_ai(prompt)
    return [line.strip("- ").strip() for line in result.split("\n") if line.strip()]
