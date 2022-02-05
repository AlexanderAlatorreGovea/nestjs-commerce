import { Args, Query, Resolver } from '@nestjs/graphql';
import { IdeaService } from './idea.service';

@Resolver()
export class IdeaResolver {
  constructor(private ideaService: IdeaService) {}

  @Query()
  ideas(@Args('page') page: number, @Args('newest') newest: boolean) {
    this.ideaService.showAll(page, newest);
  }
}
