require('module-alias/register');

import * as Moment from 'moment-timezone';

import { EventSubscriber, EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';

import { Media } from '@models/media.model';
import { MediaService } from '@services/media.service';
import { CacheService } from '@services/cache.service';
@EventSubscriber()
export class MediaSubscriber implements EntitySubscriberInterface<Media> {

  previous: Media;

  /**
   * @description Indicates that this subscriber only listen to Media events.
   *
   * TODO: emit custom event to say what to external services
   */
  listenTo(): any {
    return Media;
  }

  /**
   * @description Called before media insertion.
   */
  beforeInsert(event: InsertEvent<Media>): void {
    event.entity.createdAt = Moment( new Date() ).utc(true).toDate();
  }

  /**
   * @description Called after media insertion.
   */
  afterInsert(event: InsertEvent<Media>): void {
    MediaService.rescale(event.entity);
    CacheService.refresh('medias');
  }

  /**
   * @description Called before media update.
   */
  beforeUpdate(event: UpdateEvent<Media>): void {
    event.entity.updatedAt = Moment( new Date() ).utc(true).toDate();
    this.previous = event.databaseEntity;
  }

  /**
   * @description Called after media update.
   */
  afterUpdate(event: UpdateEvent<Media>): void {
    MediaService.rescale(event.entity);
    MediaService.remove(this.previous);
    CacheService.refresh('medias');
  }

  /**
   * @description Called after media deletetion.
   */
  afterRemove(event: RemoveEvent<Media>): void {
    MediaService.remove(event.entity);
    CacheService.refresh('medias');
  }

}
