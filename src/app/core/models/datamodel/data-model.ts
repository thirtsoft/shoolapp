
export interface Data<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
}
export interface DataResult<T> {
  data: Data<T>
}



