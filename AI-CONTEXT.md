# AI-CONTEXT.md

## Project Name

**Autonomous Business Assistant - Supply Chain Management Dashboard**

## Project Description

An intelligent, autonomous Supply Chain Management (SCM) dashboard that leverages AI agents to streamline supply chain operations. The platform provides real-time visibility into inventory management, vendor relationships, logistics operations, and procurement workflows.

The dashboard features autonomous AI agents that can:

- Monitor inventory levels and trigger automated procurement workflows
- Analyze vendor communications and extract actionable insights
- Manage logistics operations with Kanban-style tracking
- Generate and dispatch RFQs (Request for Quotations) to vendors
- Provide approval workflows for critical business decisions
- Compare vendor performance and pricing analytics

This React-based web application serves as the central command center for supply chain professionals, enabling them to interact with autonomous AI agents through natural language and visualize complex supply chain data in an intuitive interface.

## Project Type

Single Page Application (SPA) – Frontend Dashboard

## Current Version

0.0.0 (Development Phase)

## Tech Stack

- **Programming Language:** TypeScript, JavaScript (ES6+)
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS 4.x, Custom CSS
- **Type Checking:** TypeScript 5.9.x
- **Package Manager:** npm (Node.js default)

## Libraries & Frameworks

### Core Dependencies

- react@^19.2.0
- react-dom@^19.2.0

### Development Dependencies

- **Build & Dev Tools:**
  - vite@^7.3.1
  - @vitejs/plugin-react@^5.1.1
  - typescript@~5.9.3
- **Styling:**
  - tailwindcss@^4.2.0
  - @tailwindcss/postcss@^4.2.0
  - postcss@^8.5.6
  - autoprefixer@^10.4.24

- **Code Quality:**
  - eslint@^10.0.0
  - @eslint/js@^9.39.1
  - eslint-plugin-react-hooks@^7.0.1
  - eslint-plugin-react-refresh@^0.4.24
  - typescript-eslint@^8.36.0
  - globals@^16.5.0

- **Type Definitions:**
  - @types/react@^19.2.7
  - @types/react-dom@^19.2.3
  - @types/node@^24.10.1

## Development Tools

- **Node.js:** v20.x or later (recommended)
- **Package Manager:** npm
- **Dev Server:** Vite (with HMR - Hot Module Replacement)
- **Linter:** ESLint
- **Type Checker:** TypeScript Compiler

## Project Structure

```
SCM-Dashboard/
├── public/                 # Static assets served directly
├── src/
│   ├── App.tsx            # Main App component & routing logic
│   ├── App.css            # App-specific styles
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles & Tailwind imports
│   ├── assets/            # Images, fonts, icons, static files
│   └── components/        # React components
│       ├── ApprovalWorkflowModal.tsx      # Approval workflow UI
│       ├── EmailExtractionModal.tsx       # Email analysis & extraction
│       ├── LogisticsKanban.tsx            # Kanban board for logistics
│       ├── OrdersPage.tsx                 # Orders management interface
│       ├── RawInventoryAI.tsx             # AI-powered inventory tracking
│       └── VendorComparisonDashboard.tsx  # Vendor analytics & comparison
├── eslint.config.js       # ESLint configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── tsconfig.json          # TypeScript base configuration
├── tsconfig.app.json      # App-specific TypeScript config
├── tsconfig.node.json     # Node-specific TypeScript config
├── vite.config.ts         # Vite build configuration
├── package.json           # Dependencies & scripts
└── README.md              # Project documentation
```

## Coding Standards

### General Principles

- **TypeScript First:**
  - Use TypeScript for all React components and business logic
  - Define explicit types or interfaces for all component props, state, and function parameters
  - Specify return types for all functions explicitly
  - **Never use `any` type** – prefer `unknown`, specific types, or generic types
  - Create type definitions in separate files if they're shared across multiple components

- **Modern JavaScript:**
  - Use ES6+ features (arrow functions, destructuring, spread operators, optional chaining)
  - Use functional components exclusively (no class components)
  - Leverage React 19 hooks (useState, useEffect, useCallback, useMemo, etc.)
  - Use async/await for asynchronous operations

- **Component Architecture:**
  - Keep components small, focused, and single-responsibility
  - Extract reusable logic into custom hooks
  - Separate presentation components from container components
  - Use composition over inheritance
  - Props should be immutable; use state for mutable data

- **Code Quality:**
  - Remove unused imports, variables, and commented code before committing
  - Write self-documenting code with clear, descriptive names
  - Add comments only for complex business logic or non-obvious implementations
  - Keep functions small (ideally under 50 lines)
  - Avoid deep nesting (max 3-4 levels)

### Naming Conventions

- **Folders:**
  - Use `lowercase` or `kebab-case` for general folders (e.g., `components`, `assets`)
  - Use `PascalCase` only for component-specific folders if needed

- **Files:**
  - **React Components:** `PascalCase` (e.g., `App.tsx`, `LogisticsKanban.tsx`, `VendorComparisonDashboard.tsx`)
  - **Utilities & Hooks:** `camelCase` (e.g., `useAuth.ts`, `apiHelpers.ts`, `dateUtils.ts`)
  - **Configuration Files:** `lowercase` with extensions (e.g., `vite.config.ts`, `tailwind.config.js`)
  - **Style Files:** `lowercase` or match component name (e.g., `index.css`, `App.css`)

- **Variables & Functions:**
  - **Variables:** `camelCase` (e.g., `userName`, `isLoading`, `vendorList`)
  - **Constants:** `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `MAX_RETRY_ATTEMPTS`, `DEFAULT_TIMEOUT`)
  - **Functions:** `camelCase` with verb prefixes (e.g., `fetchUserData`, `handleSubmit`, `calculateTotal`)
  - **React Components:** `PascalCase` (e.g., `OrdersPage`, `EmailExtractionModal`)
  - **Boolean Variables:** Use `is`, `has`, `should` prefixes (e.g., `isVisible`, `hasPermission`, `shouldRender`)

- **Props & State:**
  - Props interfaces: `<ComponentName>Props` (e.g., `OrdersPageProps`, `LogisticsKanbanProps`)
  - State types: `<StateName>State` or descriptive names (e.g., `UserState`, `FormData`)

### Styling Guidelines

- **Tailwind CSS:**
  - Use Tailwind utility classes as the primary styling method
  - Follow Tailwind's responsive design patterns (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`)
  - Use Tailwind's dark mode utilities when implementing theme switching
  - Extract repeated utility combinations into custom CSS classes when necessary
  - Use `@apply` directive in CSS files for component-specific class compositions

- **Custom CSS:**
  - Use CSS modules or scoped styles when Tailwind is insufficient
  - Follow BEM naming convention for custom classes (e.g., `.card__header--active`)
  - Group related styles together
  - Use CSS variables for theme colors and reusable values
  - Keep specificity low; avoid deep selector nesting

- **Responsive Design:**
  - **Mobile-first approach:** Design for mobile, then scale up
  - Support breakpoints: Mobile (< 640px), Tablet (640px-1024px), Desktop (> 1024px)
  - Test all features on different screen sizes
  - Use flexbox and grid for layouts
  - Ensure touch-friendly interactive elements (min 44x44px tap targets)

- **Accessibility:**
  - Use semantic HTML elements
  - Include ARIA labels for interactive elements
  - Ensure keyboard navigation works correctly
  - Maintain sufficient color contrast ratios
  - Provide focus indicators for interactive elements

### TypeScript Patterns

```typescript
// ✅ Good: Explicit types, clear interfaces
interface VendorData {
  id: string;
  name: string;
  rating: number;
  lastOrderDate: Date;
}

interface VendorComparisonProps {
  vendors: VendorData[];
  onVendorSelect: (vendorId: string) => void;
  isLoading?: boolean;
}

const VendorComparison = ({
  vendors,
  onVendorSelect,
  isLoading = false,
}: VendorComparisonProps): JSX.Element => {
  // Component implementation
};

// ❌ Bad: Using 'any', implicit types
const VendorComparison = ({ vendors, onVendorSelect }: any) => {
  // Component implementation
};
```

### Code Organization

- **Import Order:**
  1. React and React-related imports
  2. External library imports (alphabetically)
  3. Internal module imports (components, hooks, utils)
  4. Type imports
  5. Asset imports (CSS, images)
  6. Relative imports (from parent or sibling directories)

  ```typescript
  // Example import order
  import { useState, useEffect } from "react";

  import { someLibraryFunction } from "external-library";

  import { Button } from "@/components/Button";
  import { useAuth } from "@/hooks/useAuth";
  import { formatDate } from "@/utils/dateUtils";

  import type { User, UserRole } from "@/types/user";

  import "./App.css";
  ```

- **Export Patterns:**
  - Use named exports for utilities and hooks
  - Use default exports for React components
  - Export types and interfaces separately

  ```typescript
  // Component file
  export interface ButtonProps {
    /* ... */
  }

  const Button = (props: ButtonProps) => {
    /* ... */
  };

  export default Button;
  ```

### State Management

- **Local State:**
  - Use `useState` for component-local state
  - Use `useReducer` for complex state logic with multiple sub-values
- **Shared State:**
  - Lift state up to the nearest common ancestor when sharing between components
  - Consider Context API for deeply nested prop drilling (e.g., theme, user auth)
  - Future: Integrate Redux or Zustand if global state complexity increases

- **Server State:**
  - Plan to integrate React Query or SWR for server-state management
  - Cache API responses appropriately
  - Handle loading, error, and success states consistently

### Error Handling

- **Try-Catch Blocks:**
  - Use try-catch for all async operations
  - Provide meaningful error messages to users
  - Log errors to console during development; integrate error tracking (e.g., Sentry) in production

- **Error Boundaries:**
  - Implement React Error Boundaries for component-level error catching
  - Provide fallback UI for crashed components

- **Validation:**
  - Validate user inputs on both client and server sides
  - Use TypeScript for compile-time type safety
  - Provide clear, actionable error feedback

### Performance Optimization

- **React Optimization:**
  - Use `React.memo` for components that render frequently with the same props
  - Use `useCallback` to memoize callback functions passed as props
  - Use `useMemo` to memoize expensive computations
  - Avoid inline function definitions in render methods
  - Lazy load components and routes where appropriate

- **Bundle Optimization:**
  - Code-split large components using `React.lazy` and `Suspense`
  - Optimize images (use WebP, lazy loading)
  - Tree-shake unused code
  - Analyze bundle size regularly

### Documentation Standards

- **Code Comments:**
  - Use JSDoc comments for complex functions and components:
    ```typescript
    /**
     * Fetches vendor data from the API and filters by active status
     * @param vendorId - The unique identifier for the vendor
     * @param includeInactive - Whether to include inactive vendors
     * @returns Promise resolving to vendor data array
     * @throws {Error} When API request fails
     */
    async function fetchVendorData(
      vendorId: string,
      includeInactive: boolean = false,
    ): Promise<VendorData[]> {
      // Implementation
    }
    ```
  - Comment complex business logic, algorithms, or workarounds
  - Keep comments up-to-date with code changes

- **README.md:**
  - Maintain project setup instructions
  - Document environment variables and configuration
  - Include build and deployment steps
  - List available scripts and their purposes

- **Component Documentation:**
  - Document props and expected behavior
  - Include usage examples for complex components
  - Note any side effects or external dependencies

### Testing (Future Implementation)

- **Unit Tests:**
  - Test individual functions and components in isolation
  - Use Jest and React Testing Library
  - Aim for 70%+ code coverage

- **Integration Tests:**
  - Test component interactions and data flow
  - Mock external API calls

- **E2E Tests:**
  - Use Playwright or Cypress for critical user flows
  - Test across different browsers and devices

### Version Control & Git

- **Commit Messages:**
  - Use conventional commits format: `type(scope): description`
  - Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
  - Example: `feat(inventory): add AI-powered stock level alerts`

- **Branching Strategy:**
  - `main`: Production-ready code
  - `develop`: Integration branch for features
  - `feature/<feature-name>`: Individual feature branches
  - `bugfix/<bug-name>`: Bug fix branches

- **Pull Requests:**
  - Include clear descriptions and screenshots
  - Link to relevant issues
  - Ensure all checks pass before merging

## Project-Specific Conventions

### AI Agent Integration

- All AI agent-related features should be clearly separated
- Agent responses should be properly typed
- Handle agent communication failures gracefully
- Provide loading states during agent processing

### Modal Components

- Modal components should accept `isOpen` and `onClose` props
- Use consistent modal sizing and positioning
- Implement proper focus trapping and keyboard navigation
- Provide clear close actions (X button, ESC key, overlay click)

### Dashboard Features

- All dashboard sections should be responsive
- Use consistent card/panel styling across the application
- Implement proper loading skeletons for async data
- Handle empty states gracefully with helpful messages

### Dark Mode Support

- Design all components with dark mode in mind
- Use Tailwind's dark mode utilities
- Ensure proper contrast ratios in both themes
- Persist user theme preference

## AI Agent Guidelines

### When Suggesting Code Changes

- **Follow Established Patterns:**
  - Maintain consistency with existing component structure
  - Use the same styling approach (Tailwind-first)
  - Follow the naming conventions outlined above
  - Ensure TypeScript strict mode compatibility

- **Consider the Tech Stack:**
  - Leverage React 19 features appropriately
  - Use Tailwind CSS for styling unless custom CSS is necessary
  - Ensure compatibility with Vite build system
  - Use TypeScript's latest features when beneficial

- **Architecture Alignment:**
  - Keep components small and focused
  - Extract reusable logic into custom hooks
  - Maintain separation of concerns
  - Consider performance implications

- **Security & Best Practices:**
  - Sanitize user inputs
  - Avoid XSS vulnerabilities
  - Use HTTPS for API calls
  - Never commit sensitive credentials
  - Validate data from external sources

### Preferred Response Format

- **Code Examples:**
  - Provide complete, runnable code snippets
  - Include all necessary imports
  - Use proper TypeScript types
  - Follow the project's formatting style

- **Explanations:**
  - Explain the reasoning behind complex logic
  - Highlight any trade-offs or considerations
  - Suggest alternative approaches when relevant
  - Reference official documentation when applicable

- **Testing Suggestions:**
  - Recommend test cases for new functionality
  - Suggest edge cases to consider
  - Provide example test code when helpful

- **Breaking Changes:**
  - Clearly flag any breaking changes
  - Provide migration paths
  - Explain the benefits of the change

- **Documentation:**
  - Reference relevant sections of this file
  - Link to external documentation when helpful
  - Suggest updates to README or other docs when needed

### Common Patterns to Follow

- **API Calls:**

  ```typescript
  const [data, setData] = useState<DataType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/endpoint");
        const result: DataType = await response.json();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  ```

- **Form Handling:**

  ```typescript
  interface FormData {
    field1: string;
    field2: number;
  }

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    // Handle form submission
  };
  ```

- **Event Handlers:**
  ```typescript
  const handleClick = useCallback(
    (id: string): void => {
      // Handle click event
    },
    [
      /* dependencies */
    ],
  );
  ```

## Build & Deployment

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

### Environment Variables

- Create `.env` file for environment-specific variables
- Never commit `.env` files
- Use `VITE_` prefix for variables accessible in client code
- Document all required environment variables in README

### Production Considerations

- Optimize bundle size
- Enable production mode for React
- Implement proper error tracking
- Set up CI/CD pipelines
- Configure CDN for static assets
- Enable gzip/brotli compression

---

## Maintenance & Updates

**Last Updated:** February 21, 2026

**Maintainers:** ABAC Development Team

**Update Policy:** This file should be updated whenever:

- Project dependencies are upgraded
- New patterns or conventions are adopted
- Project structure changes significantly
- New features or modules are added

---

_Keep this file up-to-date to ensure AI agents and developers have accurate context about the project._
