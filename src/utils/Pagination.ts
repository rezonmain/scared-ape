export type PaginationOpt = {
  limit: number;
  offset: number;
};

export type Paginated<T> = {
  list: T[];
  pagination: IPagination;
};

interface IPagination {
  currentPage: number;
  nextPage: number | null;
  previousPage: number | null;
  pageSize: number;
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
      previousPage: this.previousPage,
      pageSize: this.limit,
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

  get previousPage(): number | null {
    const prev = this.currentPage - 1;
    return prev < 1 ? null : prev;
  }

  get totalPages(): number {
    return Math.ceil(this.totalRows / this.limit);
  }

  get totalRecords(): number {
    return this.totalRows;
  }

  get pageSize(): number {
    return this.limit;
  }

  static defaultLimit = 10;
}
