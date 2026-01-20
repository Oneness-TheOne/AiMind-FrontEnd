import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { image } = await request.json()

    if (!image) {
      return Response.json({ error: "이미지가 필요합니다" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `이 이미지는 아이가 그린 그림일기입니다. 이미지에서 손글씨로 작성된 모든 텍스트를 정확하게 추출해주세요.

규칙:
1. 아이의 글씨체를 고려하여 최대한 정확하게 인식해주세요
2. 맞춤법 오류가 있어도 원본 그대로 추출해주세요
3. 줄바꿈은 유지해주세요
4. 날짜, 제목, 본문 등 모든 텍스트를 포함해주세요
5. 텍스트가 없거나 읽을 수 없는 경우 "텍스트를 찾을 수 없습니다"라고 응답해주세요

추출된 텍스트만 응답해주세요. 다른 설명은 필요 없습니다.`
            },
            {
              type: "image",
              image: image
            }
          ]
        }
      ]
    })

    return Response.json({ text })
  } catch (error) {
    console.error("OCR Error:", error)
    return Response.json(
      { error: "텍스트 추출 중 오류가 발생했습니다" },
      { status: 500 }
    )
  }
}
