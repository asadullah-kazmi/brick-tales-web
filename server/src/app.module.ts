import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ContentModule } from './content/content.module';
import { StreamingModule } from './streaming/streaming.module';
import { DownloadsModule } from './downloads/downloads.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SubscriptionsModule,
    ContentModule,
    StreamingModule,
    DownloadsModule,
    AdminModule,
  ],
})
export class AppModule {}
