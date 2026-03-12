# Contributing to Buckle Up

Thanks for your interest in contributing! This project tracks lineal championship belts across professional sports leagues.

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.9+ (only needed for data ingestion scripts)

### Setup

```bash
# Clone the repo
git clone https://github.com/your-username/buckle-up.git
cd buckle-up

# Install web dependencies and start dev server
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Running Tests

Tests run automatically as a pre-commit hook. You can also run them manually:

```bash
cd web
npm run test:run    # Run once
npm test            # Watch mode
npm run test:coverage
```

## Ways to Contribute

### Fix a Bug or Add a Feature
1. Check [existing issues](../../issues) first
2. Open an issue describing what you want to do
3. Fork the repo and create a feature branch
4. Write tests for any new functionality
5. Submit a pull request

### Improve Data Quality
- Fix incorrect game scores or dates
- Add missing historical seasons
- Update franchise lineage data (relocations, rebrands)

### Report Issues
- Data discrepancies (wrong scores, missing games)
- UI bugs or accessibility issues
- Broken data ingestion scripts

## Development Guidelines

- **Write tests.** All belt logic changes need test coverage. See `web/lib/__tests__/` for examples.
- **Keep it simple.** This is a focused project. Features should relate to belt tracking and visualization.
- **Match existing patterns.** Look at how existing leagues are implemented before adding new ones.
- **Use `isSameFranchise()`** when comparing teams across eras — never compare team abbreviations directly.
- **Don't hardcode dates for season boundaries.** Use `seasonConfig.ts` for in-season status.

## Pull Request Guidelines

- Include a clear description of what changed and why
- Reference any related issues
- Ensure all tests pass (`npm run test:run`)
- Keep PRs focused — one feature or fix per PR

## Project Structure

See [CLAUDE.md](CLAUDE.md) for detailed architecture and code documentation.

## AI-Assisted Development

This project was built with Claude Code. Contributors are welcome to use AI tools. The `CLAUDE.md` file serves as both human documentation and AI context — keep it updated if you change conventions or architecture.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
