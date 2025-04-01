import {
  Catch,
  ConflictException,
  NotFoundException,
  UnprocessableEntityException
} from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";
import { Prisma } from "@prisma/client";
import { GraphQLError, GraphQLFormattedError } from "graphql";

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter implements GqlExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError): any {
    switch (exception.code) {
      case "P2002": {
        throw new ConflictException("Not Unique Email");
      }
      case "P2003": {
        throw new UnprocessableEntityException("Entity Not Exist");
      }
      case "P2025": {
        throw new NotFoundException("Cannot find");
      }
      default:
        break;
    }
    return exception;
  }
}

export function handlePrismaErrorOld(error: any): GraphQLFormattedError {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Known Prisma error (e.g., P2002: Unique constraint failed)
    return {
      message: `Prisma error: ${error.message}`,
      extensions: {
        code: "PRISMA_ERROR",
        prismaCode: error.code, // Prisma error code
        meta: error.meta // Additional metadata from Prisma error
      }
    };
  }

  // For other types of errors, you can add more custom handling here
  return {
    message: error.message,
    extensions: {
      code: error.extensions?.code || "INTERNAL_SERVER_ERROR",
      exception: error.extensions?.exception || null,
      details: error.extensions?.response || error.message
    }
  };
}

export function handlePrismaError(error: any): GraphQLError {
  // if (error instanceof Prisma.PrismaClientKnownRequestError) {
  // Known Prisma error (e.g., P2002: Unique constraint failed)

  return {
    message:
      error.meta?.cause || error?.message || `Prisma error: ${error.name}`,
    extensions: {
      code: "PRISMA_ERROR",
      prismaCode: error.code, // Prisma error code
      meta: error.meta
      // Additional metadata from Prisma error
    }
  };
  // }
}
