import { ChatSelectors, SideBarSelectors } from '../selectors';
import { BaseElement } from './baseElement';

import { isApiStorageType } from '@/src/hooks/global-setup';
import { ExpectedConstants } from '@/src/testData';
import { Styles } from '@/src/ui/domData';
import { ChatLoader } from '@/src/ui/webElements/chatLoader';
import { Search } from '@/src/ui/webElements/search';
import { Locator, Page } from '@playwright/test';

export class SideBar extends BaseElement {
  constructor(page: Page, selector: string) {
    super(page, selector);
  }

  private search!: Search;
  private chatLoader!: ChatLoader;

  getSearch(): Search {
    if (!this.search) {
      this.search = new Search(this.page, this.rootLocator);
    }
    return this.search;
  }

  getChatLoader(): ChatLoader {
    if (!this.chatLoader) {
      this.chatLoader = new ChatLoader(this.page, this.rootLocator);
    }
    return this.chatLoader;
  }

  public newEntityButton = this.getChildElementBySelector(
    SideBarSelectors.newEntity,
  );
  public newFolderButton = this.getChildElementBySelector(
    SideBarSelectors.newFolder,
  );
  public importButton = this.getChildElementBySelector(SideBarSelectors.import);
  public exportButton = this.getChildElementBySelector(SideBarSelectors.export);
  public deleteEntitiesButton = this.getChildElementBySelector(
    SideBarSelectors.deleteEntities,
  );

  public draggableArea = this.getChildElementBySelector(
    SideBarSelectors.draggableArea,
  );
  public noResultFoundIcon = this.getChildElementBySelector(
    ChatSelectors.noResultFound,
  );
  public resizeIcon = this.getChildElementBySelector(
    SideBarSelectors.resizeIcon,
  );
  public bottomPanel = this.getChildElementBySelector(
    SideBarSelectors.bottomPanel,
  );

  public foldersSeparator = this.getChildElementBySelector(
    `${SideBarSelectors.pinnedEntities} ~ * ${SideBarSelectors.folderSeparator}`,
  );

  public async hoverOverNewEntity() {
    await this.newEntityButton.waitForState();
    await this.newEntityButton.hoverOver();
  }

  public async getNewEntityBackgroundColor() {
    const backgroundColor = await this.newEntityButton.getComputedStyleProperty(
      Styles.backgroundColor,
    );
    backgroundColor[0] = backgroundColor[0].replace(
      ExpectedConstants.backgroundColorPattern,
      '$1)',
    );
    return backgroundColor[0];
  }

  public async getNewEntityCursor() {
    return this.newEntityButton.getComputedStyleProperty(Styles.cursor);
  }

  public async createNewFolder() {
    await this.newFolderButton.click();
  }

  public async deleteAllEntities() {
    await this.deleteEntitiesButton.click();
  }

  public async getDraggableAreaColor() {
    const backgroundColor = await this.draggableArea.getComputedStyleProperty(
      Styles.backgroundColor,
    );
    backgroundColor[0] = backgroundColor[0].replace(
      ExpectedConstants.backgroundColorPattern,
      '$1)',
    );
    return backgroundColor[0];
  }

  public async resizePanelWidth(xOffset: number) {
    const resizeIconBounding = await this.resizeIcon.getElementBoundingBox();
    await this.page.mouse.move(
      resizeIconBounding!.x + resizeIconBounding!.width,
      resizeIconBounding!.height / 2,
    );
    await this.page.mouse.down();
    await this.page.mouse.move(xOffset, resizeIconBounding!.height / 2);
    await this.page.mouse.up();
  }

  public async dragEntityFromFolder(entityLocator: Locator) {
    await entityLocator.hover();
    await this.page.mouse.down();
    const draggableBounding = await this.draggableArea.getElementBoundingBox();
    await this.page.mouse.move(
      draggableBounding!.x + draggableBounding!.width / 2,
      draggableBounding!.y + draggableBounding!.height / 2,
    );
  }

  public async dragFolderToRoot(
    folderLocator: Locator,
    { isHttpMethodTriggered = false }: { isHttpMethodTriggered?: boolean } = {},
  ) {
    await folderLocator.hover();
    await this.page.mouse.down();
    const draggableBounding = await this.foldersSeparator
      .getNthElement(1)
      .boundingBox();
    await this.page.mouse.move(
      draggableBounding!.x + draggableBounding!.width / 2,
      draggableBounding!.y + draggableBounding!.height / 2,
    );
    if (isApiStorageType && isHttpMethodTriggered) {
      const respPromise = this.page.waitForResponse(
        (resp) => resp.request().method() === 'POST',
      );
      await this.page.mouse.up();
      return respPromise;
    }
    await this.page.mouse.up();
  }

  public async dragEntityToFolder(
    entityLocator: Locator,
    folderLocator: Locator,
  ) {
    await entityLocator.hover();
    await this.page.mouse.down();
    const folderBounding = await folderLocator.boundingBox();
    await this.page.mouse.move(
      folderBounding!.x + folderBounding!.width / 2,
      folderBounding!.y + folderBounding!.height / 2,
    );
  }

  public async dragAndDropEntityFromFolder(
    entityLocator: Locator,
    { isHttpMethodTriggered = false }: { isHttpMethodTriggered?: boolean } = {},
  ) {
    await this.dragEntityFromFolder(entityLocator);
    if (isApiStorageType && isHttpMethodTriggered) {
      const respPromise = this.page.waitForResponse((resp) => {
        return (
          resp.request().method() === 'PUT' ||
          resp.request().method() === 'POST'
        );
      });
      await this.page.mouse.up();
      return respPromise;
    }
    await this.page.mouse.up();
  }

  public async dragAndDropEntityToFolder(
    entityLocator: Locator,
    folderLocator: Locator,
    { isHttpMethodTriggered = false }: { isHttpMethodTriggered?: boolean } = {},
  ) {
    await this.dragEntityToFolder(entityLocator, folderLocator);
    if (isApiStorageType && isHttpMethodTriggered) {
      const respPromise = this.page.waitForResponse(
        (resp) => resp.request().method() === 'POST',
      );
      await this.page.mouse.up();
      return respPromise;
    }
    await this.page.mouse.up();
  }
}
