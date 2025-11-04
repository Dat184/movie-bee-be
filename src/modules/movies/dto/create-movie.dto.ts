import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  overview?: string;

  @IsOptional()
  @IsString()
  imdbRating?: string;

  @IsOptional()
  @IsUrl()
  trailerUrl?: string;

  @IsOptional()
  @IsString()
  genreIds?: string[];
}
