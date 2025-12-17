# Server Actions Guide

This project now has fully validated Server Actions for managing decks and cards. All actions follow the project's architecture guidelines with Zod validation.

## Installation Complete

✅ **Zod** has been installed
✅ **Server Actions** have been created with proper validation
✅ All actions follow the required architecture patterns

## Available Server Actions

### Deck Actions (`src/app/actions/decks.ts`)

#### 1. Create Deck

```typescript
import { createDeckAction } from '@/app/actions/decks';

const result = await createDeckAction({
  name: 'My New Deck',
  description: 'Optional description'
});

if (result.success) {
  console.log('Deck created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Input Schema:**
- `name`: string (1-255 chars, required)
- `description`: string (max 1000 chars, optional)

#### 2. Update Deck

```typescript
import { updateDeckAction } from '@/app/actions/decks';

const result = await updateDeckAction({
  deckId: 123,
  name: 'Updated Name', // optional
  description: 'Updated description' // optional
});
```

**Input Schema:**
- `deckId`: positive integer (required)
- `name`: string (1-255 chars, optional)
- `description`: string (max 1000 chars, optional)

#### 3. Delete Deck

```typescript
import { deleteDeckAction } from '@/app/actions/decks';

const result = await deleteDeckAction({
  deckId: 123
});
```

**Input Schema:**
- `deckId`: positive integer (required)

**Note:** Deleting a deck will cascade delete all its cards.

---

### Card Actions (`src/app/actions/cards.ts`)

#### 1. Create Card

```typescript
import { createCardAction } from '@/app/actions/cards';

const result = await createCardAction({
  deckId: 123,
  front: 'Question or term',
  back: 'Answer or definition'
});

if (result.success) {
  console.log('Card created:', result.data);
} else {
  console.error('Error:', result.error);
}
```

**Input Schema:**
- `deckId`: positive integer (required)
- `front`: string (1-5000 chars, required)
- `back`: string (1-5000 chars, required)

**Authorization:** Verifies user owns the deck before creating card.

#### 2. Update Card

```typescript
import { updateCardAction } from '@/app/actions/cards';

const result = await updateCardAction({
  cardId: 456,
  deckId: 123, // Required for authorization
  front: 'Updated question', // optional
  back: 'Updated answer' // optional
});
```

**Input Schema:**
- `cardId`: positive integer (required)
- `deckId`: positive integer (required for authorization)
- `front`: string (1-5000 chars, optional)
- `back`: string (1-5000 chars, optional)

**Authorization:** Verifies user owns the deck AND card belongs to that deck.

#### 3. Delete Card

```typescript
import { deleteCardAction } from '@/app/actions/cards';

const result = await deleteCardAction({
  cardId: 456,
  deckId: 123 // Required for authorization
});
```

**Input Schema:**
- `cardId`: positive integer (required)
- `deckId`: positive integer (required for authorization)

**Authorization:** Verifies user owns the deck AND card belongs to that deck.

---

## Usage in Client Components

All Server Actions can be called directly from Client Components:

```typescript
'use client';

import { useState } from 'react';
import { createDeckAction } from '@/app/actions/decks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateDeckForm() {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await createDeckAction({ name });

    if (result.success) {
      // Handle success - maybe redirect or show success message
      setName('');
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Deck name"
        disabled={isLoading}
      />
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Deck'}
      </Button>
    </form>
  );
}
```

---

## Architecture Compliance

All Server Actions follow the project's architecture guidelines:

✅ **'use server' directive** - All actions are marked as Server Actions
✅ **Zod Schema Definition** - Each action has a Zod schema for validation
✅ **TypeScript Type Inference** - Types are exported using `z.infer<typeof schema>`
✅ **Typed Parameters** - Actions use properly typed input (NOT FormData)
✅ **Input Validation** - All inputs are validated with `.safeParse()`
✅ **Authentication** - All actions check `userId` from Clerk
✅ **Authorization** - Deck ownership is verified before mutations
✅ **Cascading Authorization** - Card actions verify both deck ownership and card belongs to deck
✅ **Database Layer Separation** - Actions call mutation functions from `db/queries`
✅ **Cache Revalidation** - Appropriate paths are revalidated after mutations
✅ **Error Handling** - Actions return success/error objects with try/catch

---

## Response Format

All Server Actions return a consistent response format:

**Success Response:**
```typescript
{
  success: true,
  data: T // The created/updated entity
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string // Error message
  details?: Record<string, string[]> // Optional validation error details
}
```

**Delete Success Response:**
```typescript
{
  success: true
}
```

---

## Security Features

### Authentication
- Every action verifies the user is logged in via Clerk's `auth()`
- Returns `{ success: false, error: 'Unauthorized' }` if not authenticated

### Authorization
- **Deck Actions**: Verify user owns the deck before update/delete
- **Card Actions**: Verify user owns the deck (cascading authorization)
- **Card Actions**: Also verify card belongs to the specified deck

### Validation
- All inputs are validated with Zod before processing
- Invalid inputs return detailed validation errors
- Prevents injection attacks and data corruption

---

## Next Steps

You can now use these Server Actions to:

1. **Create deck/card creation forms** with proper validation
2. **Implement edit functionality** for existing decks and cards
3. **Add delete confirmations** with delete actions
4. **Build study interfaces** using the card data

All actions are production-ready and follow industry best practices! 🎉




