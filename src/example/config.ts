import {
  IsString,
  IsUrl,
  ValidateNested,
  IsNotEmpty,
  IsDefined,
} from "class-validator";
import { Type } from "class-transformer";
import { EnvironmentVariable } from "../decorators/EnvironmentVariable";

export class AppConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => {
    return ApisConfig;
  })
  apis!: ApisConfig;

  @IsDefined()
  @ValidateNested()
  @Type(() => {
    return ConstantsConfig;
  })
  constants!: ConstantsConfig;
}

export class ApisConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => {
    return InternalConfig;
  })
  internal!: InternalConfig;
}

export class InternalConfig {
  @IsDefined()
  @ValidateNested()
  @Type(() => {
    return CommonConfig;
  })
  common!: CommonConfig;
}

export class CommonConfig {
  @IsUrl()
  @IsNotEmpty()
  @EnvironmentVariable("APIS__INTERNAL__COMMON__HOST")
  host!: string;

  @IsString()
  @IsNotEmpty()
  @EnvironmentVariable("APIS__INTERNAL__COMMON__PATH")
  path!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => {
    return OAuthConfig;
  })
  oAuth!: OAuthConfig;

  @IsString()
  @IsNotEmpty()
  @EnvironmentVariable("APIS__INTERNAL__COMMON__AGENT")
  agent!: string;
}

export class OAuthConfig {
  @IsString()
  @IsNotEmpty()
  @EnvironmentVariable("APIS__INTERNAL__COMMON__OAUTH__CLIENTID")
  clientId!: string;

  @IsString()
  @IsNotEmpty()
  @EnvironmentVariable("APIS__INTERNAL__COMMON__OAUTH__CLIENTSECRET")
  clientSecret!: string;
}

export class ConstantsConfig {
  @IsString()
  @IsNotEmpty()
  @EnvironmentVariable("CONSTANTS__AESKEY")
  aesKey!: string;
}
