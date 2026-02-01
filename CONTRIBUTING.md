# Contributing to Bible Sermon Assistant

Thank you for your interest in contributing to Bible Sermon Assistant! This guide will help you get started.

---

## 🙏 Code of Conduct

This project is built to serve God's kingdom and bless pastors and preachers. We expect all contributors to:

- Be respectful and kind in all interactions
- Focus on constructive feedback
- Welcome newcomers and help them learn
- Prioritize the mission: helping preachers prepare better sermons
- Give glory to God in all we do

---

## 🚀 How to Contribute

### Ways You Can Help

1. **Report Bugs** - Found a bug? Report it!
2. **Suggest Features** - Have an idea? We'd love to hear it!
3. **Fix Issues** - Browse open issues and submit a PR
4. **Improve Documentation** - Help make our docs clearer
5. **Write Tests** - Increase code coverage
6. **Add Translations** - Help us support more languages
7. **Share the App** - Tell other pastors and preachers

---

## 🐛 Reporting Bugs

**Before reporting**, please:

1. Check if the issue already exists in [GitHub Issues](https://github.com/your-org/bible-sermon-assistant/issues)
2. Update to the latest version and see if the bug persists
3. Try to reproduce the bug consistently

**When reporting**, include:

- **Title**: Clear, descriptive summary
- **Description**: Detailed explanation of the bug
- **Steps to Reproduce**: Step-by-step instructions
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Environment**:
  - App version
  - Device (make, model)
  - Android version
  - Subscription tier

**Example**:

```
Title: Sermon generation fails on verses with special characters

Description:
When selecting a verse that contains special characters (e.g., quotation marks),
the sermon generation fails with a 400 error.

Steps to Reproduce:
1. Navigate to John 3:16
2. Long-press to select the verse
3. Tap "Generate Sermon"
4. Configure sermon settings
5. Tap "Generate"

Expected: Sermon generation should succeed
Actual: Error message "Failed to generate sermon (400)"

Environment:
- App version: 1.0.0
- Device: Samsung Galaxy S21
- Android: 13
- Tier: Premium
```

---

## 💡 Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been requested
2. Explain **why** the feature would be useful (not just **what**)
3. Consider if it fits the app's mission and scope
4. Be open to feedback and discussion

**Use this template**:

```
**Feature**: [Brief title]

**Problem**: What problem does this solve?

**Proposed Solution**: How would this feature work?

**Alternatives Considered**: Other approaches you've thought about

**Target Users**: Who would benefit? (Pastors, students, etc.)

**Priority**: High / Medium / Low
```

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v18+ (for frontend)
- **Python**: 3.11+ (for backend)
- **Git**: For version control
- **Android Studio**: For testing (optional)
- **Expo CLI**: `npm install -g expo-cli`
- **EAS CLI**: `npm install -g eas-cli` (for builds)

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/your-org/bible-sermon-assistant.git
cd bible-sermon-assistant

# Install dependencies
npm install

# Create .env file (copy from .env.example)
cp .env.example .env

# Edit .env with your credentials
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# EXPO_PUBLIC_API_BASE_URL=...

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# SUPABASE_URL=...
# SUPABASE_KEY=...
# OPENAI_API_KEY=...
# REDIS_URL=...

# Run backend
python app/main.py

# Backend will run on http://localhost:8000
```

### Running Tests

```bash
# Frontend tests
npm test
npm run test:coverage

# Backend tests
cd backend
pytest
pytest --cov=app
```

---

## 📝 Coding Standards

### TypeScript/React Native (Frontend)

- **Style**: Follow ESLint configuration
- **Naming**:
  - Components: PascalCase (`BibleReaderScreen.tsx`)
  - Functions: camelCase (`getVerses()`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Formatting**: Use Prettier (run `npm run format`)
- **Types**: Prefer TypeScript types over `any`
- **Components**: Use functional components with hooks
- **State**: Use Zustand for global state, `useState` for local state

**Example**:

```typescript
// Good
interface VerseProps {
  bookId: number;
  chapter: number;
  verse: number;
}

const VerseComponent: React.FC<VerseProps> = ({ bookId, chapter, verse }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);

  return <Text>{verse}</Text>;
};

// Bad
const VerseComponent = (props: any) => {
  var highlighted = false;
  return <Text>{props.verse}</Text>;
};
```

### Python/FastAPI (Backend)

- **Style**: Follow PEP 8 (run `black .` to format)
- **Naming**:
  - Functions: snake_case (`generate_sermon()`)
  - Classes: PascalCase (`SermonService`)
  - Constants: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Type Hints**: Use type hints for all functions
- **Async**: Use `async`/`await` for I/O operations
- **Models**: Use Pydantic for validation

**Example**:

```python
# Good
from pydantic import BaseModel
from typing import List, Optional

class SermonRequest(BaseModel):
    verses: List[str]
    sermon_type: str
    target_audience: Optional[str] = "general"

async def generate_sermon(request: SermonRequest, user_id: str) -> SermonResponse:
    # Implementation
    pass

# Bad
def generate_sermon(verses, type):
    # Implementation
    pass
```

---

## 🔀 Pull Request Process

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOUR_USERNAME/bible-sermon-assistant.git
cd bible-sermon-assistant
git remote add upstream https://github.com/original-org/bible-sermon-assistant.git
```

### 2. Create a Branch

```bash
# Create feature branch from main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

**Branch naming**:
- `feature/sermon-templates` - New feature
- `fix/search-crash` - Bug fix
- `docs/api-documentation` - Documentation
- `test/sermon-service` - Tests
- `refactor/sync-service` - Code refactoring

### 3. Make Changes

- Write clean, readable code
- Follow coding standards (see above)
- Add tests for new functionality
- Update documentation if needed
- Keep commits small and focused

### 4. Test Your Changes

```bash
# Frontend
npm test
npm run lint
npm run type-check

# Backend
cd backend
pytest
black . --check
mypy app
```

### 5. Commit Your Changes

Use [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Format: <type>(<scope>): <description>

git commit -m "feat(sermon): add sermon template selection"
git commit -m "fix(search): resolve crash on special characters"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(sync): add tests for conflict resolution"
```

**Types**: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `style`

### 6. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name
```

Then:
1. Go to GitHub and create a Pull Request
2. Fill in the PR template
3. Link related issues
4. Request review from maintainers

### 7. PR Template

```markdown
## Description
Brief description of changes

## Related Issue
Fixes #123

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings introduced
```

---

## 🧪 Testing Guidelines

### Frontend Tests

- **Unit Tests**: Test business logic in services and stores
- **Component Tests**: Test React components in isolation
- **Integration Tests**: Test multiple components working together

**Example**:

```typescript
// src/services/__tests__/BibleService.test.ts
import BibleService from '../BibleService';

describe('BibleService', () => {
  it('should fetch verses for a chapter', async () => {
    const verses = await BibleService.getVerses(1, 1);
    expect(verses).toHaveLength(31); // Genesis 1 has 31 verses
    expect(verses[0].verse).toBe(1);
  });
});
```

### Backend Tests

- **Unit Tests**: Test individual functions
- **Integration Tests**: Test API endpoints
- **Mock External Services**: Don't call OpenAI/Supabase in tests

**Example**:

```python
# backend/tests/test_sermons_api.py
import pytest
from fastapi.testclient import TestClient

def test_generate_sermon_success(test_client: TestClient, mock_jwt_token: str):
    response = test_client.post(
        "/api/v1/sermons/generate",
        json={"verses": ["John 3:16"], "sermon_type": "expository"},
        headers={"Authorization": f"Bearer {mock_jwt_token}"}
    )
    assert response.status_code == 200
    assert "title" in response.json()
```

---

## 📚 Documentation

### Code Comments

- Add comments for **why**, not **what**
- Document complex algorithms
- Use JSDoc/docstrings for functions

**Good**:
```typescript
// Use SHA-256 hash to ensure same config always produces same cache key
const cacheKey = await generateCacheKey(verses, config);
```

**Bad**:
```typescript
// Generate cache key
const cacheKey = await generateCacheKey(verses, config);
```

### Documentation Files

Update relevant docs when making changes:

- `README.md` - Overview, setup, quick start
- `DEPLOYMENT.md` - Deployment instructions
- `TROUBLESHOOTING.md` - Common issues
- API docs - Endpoint descriptions

---

## 🌍 Adding Translations

We'd love to support more languages! To add a translation:

1. **Bible Text**: Source from [eBible.org](https://ebible.org)
2. **UI Translations**: Add to `src/locales/[language].json`
3. **Documentation**: Translate key docs (README, QUICKSTART)

**Steps**:

```bash
# 1. Add Bible data
cd scripts
python parse_usfm.py --language hindi --output assets/bible_hindi.db

# 2. Add UI translations
# Create src/locales/hi.json
{
  "bible.books": "पुस्तकें",
  "sermon.generate": "उपदेश उत्पन्न करें",
  ...
}

# 3. Update language selector
# Add to src/utils/languages.ts
```

---

## 🎨 Design Guidelines

### UI/UX Principles

- **Simple**: Keep interfaces clean and uncluttered
- **Accessible**: Use good contrast, readable fonts, touch targets
- **Consistent**: Follow existing design patterns
- **Performant**: Optimize for low-end devices
- **Offline-First**: All core features work offline

### Design Resources

- **Colors**: See `src/utils/theme.ts`
- **Typography**: Use predefined font sizes
- **Components**: Reuse existing components when possible
- **Icons**: Use Expo Vector Icons (MaterialIcons)

---

## 🏆 Recognition

Contributors will be recognized in:

- `CONTRIBUTORS.md` file
- App "About" screen
- Release notes (for significant contributions)

---

## ❓ Questions?

- **General Questions**: Open a [GitHub Discussion](https://github.com/your-org/bible-sermon-assistant/discussions)
- **Bug Reports**: Open a [GitHub Issue](https://github.com/your-org/bible-sermon-assistant/issues)
- **Security Issues**: Email security@biblesermonassistant.com
- **General Support**: Email support@biblesermonassistant.com

---

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

See [LICENSE](LICENSE) file for details.

---

**Thank you for contributing to Bible Sermon Assistant!**

May God bless your efforts to help preachers around the world share His Word more effectively.

🙏 *Soli Deo Gloria* (Glory to God Alone)
