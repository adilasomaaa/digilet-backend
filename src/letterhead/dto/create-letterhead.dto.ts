import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLetterheadDto {
  @ApiProperty({ example: 'Header Name', description: 'Header Name' })
  @IsNotEmpty({ message: 'Nama header tidak boleh kosong' })
  @IsString({ message: 'Nama header harus berupa teks' })
  name: string;

  @ApiProperty({ example: 'Main Header', description: 'Header' })
  @IsNotEmpty({ message: 'Header tidak boleh kosong' })
  @IsString({ message: 'Header harus berupa teks' })
  header: string;

  @ApiProperty({ example: 'Sub Header', description: 'Sub Header' })
  @IsNotEmpty({ message: 'Sub header tidak boleh kosong' })
  @IsString({ message: 'Sub header harus berupa teks' })
  subheader: string;

  @ApiProperty({ example: 'Jl. Merdeka No. 123', description: 'Address' })
  @IsNotEmpty({ message: 'Alamat tidak boleh kosong' })
  @IsString({ message: 'Alamat harus berupa teks' })
  address: string;

  @ApiProperty({
    example: 'http://example.com/image.jpg',
    description: 'Logo URL',
  })
  @IsOptional()
  logo: string;
}
