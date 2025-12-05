import {
  IsArray,
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
  trailerUrl?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  genreIds?: string[];

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  castIds?: string[];
}
