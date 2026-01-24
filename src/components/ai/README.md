# AI Components

## ChatInterface

The main conversational interface for AI workout programming.

### Features

- **Real-time chat**: Conversational UI with message history
- **Context-aware**: Uses user's experience level, current templates, and recent workouts
- **Clarifying questions**: Asks for more info when needed
- **Template generation**: Creates and saves templates directly to user's account
- **Error handling**: Graceful fallbacks for API failures
- **Loading states**: Visual feedback during AI processing
- **Quick suggestions**: Pre-filled prompts for common requests

### Usage

```tsx
import ChatInterface from "@/components/ai/ChatInterface";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function AIPage() {
  const user = useCurrentUser();
  
  if (!user) return <div>Loading...</div>;
  
  return <ChatInterface userId={user._id} />;
}
```

### Props

- `userId` (Id<"users">): The current user's ID from Convex

### Message Flow

1. User types message → Submit
2. Message added to chat history
3. API call to `/api/ai/generate` with user context
4. AI processes request (Gemini API)
5. Response parsed and validated
6. If clarifying questions → Show in chat
7. If templates → Create in Convex → Show confirmation
8. Interaction saved to database

### Styling

Uses Tailwind CSS with dark theme:
- User messages: Blue background (`bg-blue-600`)
- AI messages: Dark gray background (`bg-zinc-800`)
- Input: Dark with blue focus ring
- Suggestions: Pill-shaped buttons

### Error Handling

- **Network errors**: Shows error message in chat
- **API failures**: Safe fallback with clarifying questions
- **Malformed responses**: Parsed and validated, fallback if invalid
- **Missing context**: Waits for user context to load before enabling input

### Future Enhancements

- [ ] Multi-turn conversation memory
- [ ] Edit/regenerate responses
- [ ] Export conversation history
- [ ] Voice input support
- [ ] Markdown rendering for AI responses
- [ ] Exercise preview cards
- [ ] Template preview before saving

