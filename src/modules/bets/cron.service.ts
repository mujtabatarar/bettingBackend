import { getRepository, LessThanOrEqual, Repository } from 'typeorm';
import * as cron from 'node-cron';
import { MatchEntity } from './entities/bets.entity';
import { InjectRepository } from '@nestjs/typeorm';

export class CronService {

    constructor(
        @InjectRepository(MatchEntity)
        private matchRepository: Repository<MatchEntity>,) {

        this.startCronJob();
    }

    private startCronJob() {
        // Schedule a cron job to run every 5 minutes
        cron.schedule('*/5 * * * *', async () => {
            const now = new Date();
            console.log(`Cron job running at ${now.toISOString()}`);

            try {
                // Find matches that are scheduled and their matchDate is in the past
                const matchesToGoLive = await this.matchRepository.find({
                    where: {
                        status: 'scheduled',
                        matchDate: LessThanOrEqual(now)
                    }
                });

                // Update status of these matches to 'live'
                for (const match of matchesToGoLive) {
                    match.status = 'live';
                    await this.matchRepository.save(match);
                    console.log(`Match ${match.id} set to live`);
                }
            } catch (error) {
                console.error('Error updating match statuses:', error);
            }
        });
    }
}
