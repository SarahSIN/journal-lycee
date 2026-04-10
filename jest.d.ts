/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

// Déclarations de types pour Jest
declare global {
  namespace jest {
    interface Mock<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mock: {
        calls: Y[];
        results: Array<{
          type: 'return' | 'throw';
          value: any;
        }>;
      };
      mockClear(): void;
      mockReset(): void;
      mockRestore(): void;
      mockImplementation(fn?: (...args: Y) => T): this;
      mockImplementationOnce(fn?: (...args: Y) => T): this;
      mockReturnThis(): this;
      mockReturnValue(value: T): this;
      mockReturnValueOnce(value: T): this;
      mockResolvedValue(value: T): this;
      mockResolvedValueOnce(value: T): this;
      mockRejectedValue(value: any): this;
      mockRejectedValueOnce(value: any): this;
    }

    function fn<T = any>(implementation?: (...args: any[]) => T): Mock<T>;
    function mock(moduleName: string, factory?: jest.MockFactory, options?: jest.MockOptions): jest.Mocked<any>;
  }
}

// Étendre les déclarations globales pour Next.js et React
declare module 'next/navigation' {
  export function useRouter(): {
    route: string;
    pathname: string;
    query: Record<string, string>;
    asPath: string;
    push: jest.Mock;
    replace: jest.Mock;
    reload: jest.Mock;
    back: jest.Mock;
    prefetch: jest.Mock;
    beforeHistoryChange: jest.Mock;
    isReady: boolean;
  };
  export function usePathname(): jest.Mock;
}

export {};