# Contributing Guide

Thank you for your interest in contributing to the Afghan Exchange Market project!

---

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported
2. Open a new issue with:
   - Clear title describing the bug
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Check if the feature has been requested
2. Open a new issue with:
   - Clear title describing the feature
   - Use case and benefit
   - Proposed implementation (optional)
   - Mockups if applicable

### Contributing Code

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## Development Process

### Branch Naming

```
feature/description    # New features
fix/description        # Bug fixes
docs/description       # Documentation
refactor/description   # Code refactoring
```

Examples:
```
feature/add-sms-alerts
fix/login-validation
docs/update-api-reference
refactor/auth-middleware
```

### Commit Messages

Follow conventional commits:

```
feat: add SMS notification support
fix: resolve login validation error
docs: update API documentation
refactor: simplify auth middleware
style: format code with prettier
test: add user controller tests
chore: update dependencies
```

### Pull Request Process

1. **Title**: Clear description of changes
2. **Description**: Explain what and why
3. **Screenshots**: For UI changes
4. **Testing**: Describe how you tested
5. **Checklist**:
   - [ ] Code follows style guide
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No breaking changes (or noted)

---

## Code Review

### What We Look For

- **Correctness**: Does it work?
- **Security**: Any vulnerabilities?
- **Performance**: Any bottlenecks?
- **Readability**: Is it clear?
- **Tests**: Are there tests?
- **Documentation**: Is it documented?

### Review Timeline

- Initial review: 1-3 days
- Follow-up reviews: 1 day
- Merge after approval

---

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful comments
- Use descriptive variable names

### Best Practices

#### TypeScript

```typescript
// Good: Use interfaces
interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

// Good: Type function parameters and returns
function getUser(id: number): Promise<User | undefined> {
  // ...
}

// Avoid: any type
// Bad: function process(data: any)
// Good: function process(data: RequestData)
```

#### React

```typescript
// Good: Functional components with TypeScript
interface Props {
  title: string;
  onClose: () => void;
}

export const Modal = ({ title, onClose }: Props) => {
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onClose}>Close</button>
    </div>
  );
};
```

#### Express

```typescript
// Good: Proper error handling
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

## Testing Guidelines

### What to Test

- API endpoints work correctly
- Authentication and authorization
- Input validation
- Edge cases and error handling
- UI renders correctly
- Forms submit properly

### Manual Testing Checklist

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Works in different browsers
- [ ] Responsive design works
- [ ] RTL layout works (if applicable)
- [ ] Translations are correct

---

## Documentation

### When to Update Docs

- New features
- Changed behavior
- New API endpoints
- Configuration changes
- Breaking changes

### Documentation Style

- Use clear, simple language
- Include code examples
- Add screenshots for UI
- Keep formatting consistent
- Update table of contents

---

## Security

### Reporting Vulnerabilities

- Do NOT open public issues for security vulnerabilities
- Contact maintainers directly
- Include detailed information
- Allow time for fix before disclosure

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation in place
- [ ] SQL injection protected
- [ ] XSS protected
- [ ] Authentication checked
- [ ] Authorization verified

---

## Getting Help

### Resources

- Read the documentation
- Check existing issues
- Search closed issues/PRs
- Ask in discussions

### Contact

- Open an issue for questions
- Tag maintainers for urgent items
- Be patient and respectful

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS file
- Mentioned in release notes
- Thanked in project updates

---

## Code of Conduct

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism
- Focus on the project goals
- Help others learn

### Unacceptable Behavior

- Harassment or discrimination
- Personal attacks
- Spam or off-topic posts
- Sharing private information

---

Thank you for contributing!
