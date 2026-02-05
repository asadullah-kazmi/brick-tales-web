import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { SiteService } from './site.service';
import type { SitePageDto } from './dto/site-page.dto';

@Controller('site')
export class SiteController {
  constructor(private readonly siteService: SiteService) {}

  @Public()
  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string): Promise<SitePageDto> {
    return this.siteService.getPage(slug);
  }
}
