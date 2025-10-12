export class RunnerId {
  private static separator = '-';
  private static noOrganizationId = 'noorg';

  public generateId(opts: {
    className: string;
    fullName: string;
    organizationName?: string;
  }): string {
    const orgName = opts.organizationName
      ? opts.organizationName
      : RunnerId.noOrganizationId;

    return `${opts.fullName}${RunnerId.separator}${opts.className}${RunnerId.separator}${orgName}`
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
}

export class OrganizationId {
  public generateId(opts: { organizationName: string }): string {
    // ToDo: Handle multiple club names by removing common endings like "OK", "IF", "SK", "FK", "SOK", "AIK", "KFUM"
    return opts.organizationName.toLowerCase().replace(/\s+/g, '-');
  }
}
