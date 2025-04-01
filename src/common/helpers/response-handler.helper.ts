import { ApiServiceResponse } from "../type/api-service.type";

const returnError = (statusCode: number, message: string) => {
  const response: ApiServiceResponse = {
    responseCode: statusCode,
    message,
    success: false
  };

  return response;
};

const returnSuccess = (
  statusCode: number,
  message: string,
  data?: [] | object | boolean,
  pagination?: object
) => {
  const response: ApiServiceResponse = {
    responseCode: statusCode,
    success: true,
    message,
    extraData: pagination,
    data
  };

  return response;
};

const getPaginationData = (page: number, limit: number, total?: number) => {
  const currentPage = page ? +page : 0;
  const totalData = total ? total : 0;
  const totalPages = Math.ceil(totalData / limit);

  return {
    total: totalData,
    totalPages,
    currentPage,
    perPage: limit
  };
};

export { getPaginationData, returnError, returnSuccess };
