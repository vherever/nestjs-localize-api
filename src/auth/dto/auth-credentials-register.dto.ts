import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class AuthCredentialsRegisterDTO {
  @IsString()
  @IsNotEmpty({message: 'Email should not be empty.'})
  @Matches(new RegExp(
    [
      '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|',
      '(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|',
      '(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
    ].join(''),
  ), {message: 'Email is not valid.'})
  email: string;

  @IsString()
  @IsNotEmpty({message: 'Password should not be empty.'})
  @MinLength(8, {message: 'Password must be longer than or equal to 8 characters.'})
  @MaxLength(20, {message: 'Password must be shorter than or equal to 20 characters.'})
  @Matches(
    /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,
    { message: 'Password is too weak.' },
  )
  password: string;
}
