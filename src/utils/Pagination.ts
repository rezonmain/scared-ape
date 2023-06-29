export type PaginationOpt = {
  limit: number;
  offset: number;
};

export type Paginated<T> = {
  list: T[];
  pagination: Pagination;
};

interface IPagination {
  currentPage: number;
  nextPage: number | null;
  previouPage: number | null;
  totalPages: number;
  totalRecords: number;
}

export class Pagination implements IPagination {
  constructor(
    private limit: number,
    private offset: number,
    private totalRows: number
  ) {}

  getPagination(): IPagination {
    return {
      currentPage: this.currentPage,
      nextPage: this.nextPage,
      previouPage: this.previouPage,
      totalPages: this.totalPages,
      totalRecords: this.totalRows,
    };
  }

  get currentPage(): number {
    return Math.floor(this.offset / this.limit) + 1;
  }

  get nextPage(): number | null {
    const next = this.currentPage + 1;
    return next > this.totalPages ? null : next;
  }

  get previouPage(): number | null {
    const prev = this.currentPage - 1;
    return prev < 1 ? null : prev;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRows / this.limit);
  }

  get totalRecords(): number {
    return this.totalRows;
  }
}
