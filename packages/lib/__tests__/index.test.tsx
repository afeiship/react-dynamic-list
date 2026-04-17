import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReactDynamicList from '../src';

describe('ReactDynamicList', () => {
  it('should render with default className', () => {
    render(<ReactDynamicList>hello</ReactDynamicList>);
    const el = screen.getByText('hello');
    expect(el).toBeInTheDocument();
    expect(el.closest('[data-component="react-dynamic-list"]')).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<ReactDynamicList className="custom-class">test</ReactDynamicList>);
    expect(container.firstChild).toHaveClass('react-dynamic-list', 'custom-class');
  });

  it('should render children', () => {
    render(<ReactDynamicList>child content</ReactDynamicList>);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
