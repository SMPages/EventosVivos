<!--
╔══════════════════════════════════════════════════════════════════════════════╗
║                        SYNC IMPACT REPORT v1.0.0                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

VERSION CHANGE: N/A → 1.0.0 (Initial Constitution)
BUMP RATIONALE: First official constitution for EventosVivos project

PRINCIPLES ADDED (13 total):
  ✓ I. Clean Architecture
  ✓ II. Business Rules as Priority
  ✓ III. SOLID Principles Compliance
  ✓ IV. CQRS Pattern
  ✓ V. FluentValidation for Validations
  ✓ VI. Consistent Error Handling
  ✓ VII. Automated Testing (NON-NEGOTIABLE)
  ✓ VIII. REST API Standards
  ✓ IX. Angular Frontend Standards
  ✓ X. Repository Abstraction for Persistence
  ✓ XI. Code Quality Standards
  ✓ XII. Security Requirements
  ✓ XIII. Comprehensive Documentation

SECTIONS ADDED:
  ✓ Purpose
  ✓ Delivery Priority Order
  ✓ Governance (Amendment Process, Compliance, Versioning)

TEMPLATE UPDATES REQUIRED:
  ⚠ plan-template.md: Verify "Constitution Check" gate references clean architecture
  ⚠ spec-template.md: Ensure requirements align with SOLID + validation principles
  ⚠ tasks-template.md: Review if task categorization needs testing discipline emphasis
  ℹ README.md: Should reference this constitution for architectural guidance
  ℹ docs/: May need quick-start docs linking to architecture principles

VALIDATION STATUS:
  ✓ No unexplained placeholder tokens
  ✓ All 13 principles are declarative and testable
  ✓ Version: 1.0.0 (Semantic Versioning)
  ✓ Dates in ISO format (2026-06-24)
  ✓ Governance rules documented
  ✓ No vague language (all use MUST/SHOULD with rationale)

DEFERRED ITEMS: None

═══════════════════════════════════════════════════════════════════════════════
-->

# EventosVivos Reservation System Constitution

## Purpose
Develop the core of a reservation system for EventosVivos using .NET 8 and Angular, ensuring strict compliance with functional requirements and business rules defined in the technical specification.

## Core Principles

### I. Clean Architecture
The solution must be organized in the following layers:
- **Domain**: Business logic and entities, framework-agnostic
- **Application**: Use cases and CQRS patterns (Commands/Queries)
- **Infrastructure**: Data access, external services, implementations
- **Presentation**: API controllers and frontend

Dependencies MUST always point toward the domain core. Business logic MUST NEVER depend on frameworks, databases, or presentation technologies.

### II. Business Rules as Priority
The rules RN-01 through RN-07 are the heart of the system.

All critical validations MUST be implemented in the Backend. The Frontend MAY perform user experience validations, but the API is the single source of truth for all business logic enforcement.

### III. SOLID Principles Compliance
Every component MUST respect:
- **Single Responsibility**: One reason to change
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Derived classes must be substitutable
- **Interface Segregation**: No forced dependency on unnecessary methods
- **Dependency Inversion**: Depend on abstractions, not concretions

### IV. CQRS Pattern
The Application layer MUST utilize:
- **Commands** for operations that modify state
- **Queries** for read operations

A clear separation between read and write operations MUST be maintained.

### V. FluentValidation for Validations
All validations MUST be implemented using FluentValidation framework.

Validated aspects:
- Required fields
- Date constraints (start ≤ end, future dates for events, etc.)
- Capacity constraints (maximum attendees, venue limits)
- Reservation constraints (availability, double-booking prevention)
- Valid state transitions (only permitted status changes)
- Business-specific rules (RN-01 to RN-07)

### VI. Consistent Error Handling
The API MUST return errors consistently using appropriate HTTP status codes:
- **400 Bad Request**: Malformed requests or validation failures
- **404 Not Found**: Resource not found
- **409 Conflict**: Business rule violation (e.g., double booking)
- **422 Unprocessable Entity**: Semantic validation failure

Generic errors MUST NOT be used for business rule violations. Each violation MUST return a specific, actionable error message.

### VII. Automated Testing (NON-NEGOTIABLE)
Tests are mandatory for all business logic layers.

Unit tests MUST cover:
- Event creation and state transitions
- Capacity validation and enforcement
- Schedule restriction checks and conflict detection
- Reservation operations (creation, confirmation, cancellation)
- Payment confirmation workflows
- Occupancy report generation
- All edge cases for business rules RN-01 to RN-07

**Testing Stack**:
- xUnit for test framework
- Moq for mocking dependencies
- FluentAssertions for readable assertions

All business-critical paths MUST have test coverage ≥ 80%.

### VIII. REST API Standards
The API MUST:
- Follow RESTful principles for resource design
- Expose Swagger/OpenAPI documentation
- Use DTOs (Data Transfer Objects) for all input/output contracts
- Maintain clear, versionable contracts
- Support proper HTTP verbs (GET, POST, PUT, DELETE, PATCH)

### IX. Angular Frontend Standards
The Frontend MUST:
- Use Angular Standalone Components exclusively
- Implement Reactive Forms for all user input
- Apply Signals where they provide measurable value for reactivity
- Organize code by Features (feature-based structure)
- Implement centralized error handling and user feedback
- Use typed services for all API consumption
- Follow component composition patterns for reusability

### X. Repository Abstraction for Persistence
Persistence MUST be abstracted through repositories.

Business logic MUST NOT directly depend on Entity Framework or specific database implementations. Data access logic MUST be isolated in the Infrastructure layer, allowing database changes without affecting business rules.

### XI. Code Quality Standards
All code MUST adhere to:
- Readability: Self-documenting code with clear intent
- Methods: Small, focused, single purpose (max 20 lines guideline)
- Naming: Descriptive names that convey meaning without comments
- Dependency Injection: Required for all dependencies
- DRY Principle: No duplicated logic or patterns
- Responsibility Separation: Clear layers and boundaries

### XII. Security Requirements
Security measures MUST include:
- Input validation: All user inputs MUST be validated
- State constraint enforcement: Invalid state transitions MUST be prevented
- Exception handling: Secure error messages (no stack traces to clients)
- Information protection: No exposure of sensitive data in responses or logs

### XIII. Comprehensive Documentation
The project MUST include:
- **README.md**: Detailed project overview and setup instructions
- **Architecture Justification**: Rationale for layer separation and design choices
- **Execution Instructions**: Step-by-step setup and run procedures
- **Testing Instructions**: How to run tests and interpret results
- **Technical Decisions**: Document choices and alternatives considered
- **Future Improvements**: Identified optimization and enhancement opportunities

## Delivery Priority Order
Implementation efforts MUST prioritize in this order:
1. **Business Rule Compliance**: All RN-01 to RN-07 rules MUST be correctly implemented
2. **Architectural Quality**: Layers properly separated, SOLID principles applied
3. **Test Coverage**: Comprehensive unit tests for business logic (target ≥ 80%)
4. **Maintainability**: Code readability, documentation, naming clarity
5. **Scalability**: Performance optimization and future-ready design

Preference: A simple, correctly designed solution is always better than an over-engineered solution.

## Governance

This Constitution supersedes all prior guidelines and development practices. It establishes the non-negotiable foundation for EventosVivos development.

**Amendment Process**:
- Any deviation from these principles MUST be documented and justified
- Architecture changes MUST receive design review before implementation
- Principle violations discovered in code review MUST be corrected before merge
- Constitutional amendments require documented rationale and version increment

**Compliance Verification**:
- Code reviews MUST verify Clean Architecture layer compliance
- All Pull Requests MUST include test evidence for business logic changes
- Automated builds MUST enforce test execution and coverage thresholds
- Architecture violations are non-negotiable blockers for PR approval

**Version Management**:
- Follow Semantic Versioning (MAJOR.MINOR.PATCH)
- MAJOR: Architectural changes or principle additions/removals
- MINOR: Clarifications or expanded guidance on existing principles
- PATCH: Wording corrections or typographical fixes

**Version**: 1.0.0 | **Ratified**: 2026-06-24 | **Last Amended**: 2026-06-24
