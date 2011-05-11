<#-- $This file is distributed under the terms of the license in /doc/license.txt$ -->

<header id="branding" role="banner">
    <h1 class="vivo-logo"><a title="VIVO | enabling national networking of scientists" href="${urls.home}"><span class="displace">${siteName}</span></a></h1>
    <#-- Since we are using a graphic text for the tagline, we won't render ${siteTagline}
    <#if siteTagline?has_content>
        <em>${siteTagline}</em>
    </#if>-->

    <nav role="navigation">
        <ul id="header-nav" role="list">
            <#if user.loggedIn>
                <li role="listitem"><img class="middle" src="${urls.images}/userIcon.png" alt="user icon" />${user.loginName}</li>
                <li role="listitem"><a href="${urls.logout}">Log out</a></li>
                <#if user.hasSiteAdminAccess>
                    <li role="listitem"><a href="${urls.siteAdmin}">Site Admin</a></li>
                </#if>
            <#else>
                <li role="listitem"><a title="log in to manage this site" href="${urls.login}">Log in</a></li>
            </#if>
                <li role="listitem"><a href="${urls.index}">Index</a></li>
        </ul>
    </nav>

    <section id="search" role="region">
        <fieldset>
            <legend>Search form</legend>

            <form id="search-form" action="${urls.search}" name="search" role="search">
                <div id="search-field">
                    <input type="text" name="querytext" class="search-vivo" value="${querytext!}" />
                    <div class="search-filters" style="display:none">
                        <div class="search-filter-classgroup">
                            <strong>Search for:</strong>

                            <input type="radio" name="classgroup" value="all" id="search-classgroup-1" checked="checked" />
                            <label for="search-classgroup-1">All</label>
                            <br />
                            <input type="radio" name="classgroup" value="people" id="search-classgroup-2" />
                            <label for="search-classgroup-2">People</label>
                            <br />
                            <input type="radio" name="classgroup" value="organizations" id="search-classgroup-3" />
                            <label for="search-classgroup-3">Organizations</label>
                            <br />
                            <input type="radio" name="classgroup" value="publications" id="search-classgroup-4" />
                            <label for="search-classgroup-4">Publications</label>
                            <br />
                            <input type="radio" name="classgroup" value="events" id="search-classgroup-5" />
                            <label for="search-classgroup-5">Events</label>
                            <br />
                            <input type="radio" name="classgroup" value="activities" id="search-classgroup-6" />
                            <label for="search-classgroup-6">Activities</label>
                            <br />
                            <input type="radio" name="classgroup" value="locations" id="search-classgroup-7" />
                            <label for="search-classgroup-7">Locations</label>
                            <br />
                            <input type="radio" name="classgroup" value="courses" id="search-classgroup-8" />
                            <label for="search-classgroup-8">Courses</label>
                            <br />
                            <input type="radio" name="classgroup" value="topics" id="search-classgroup-9" />
                            <label for="search-classgroup-9">Topics</label>
                        </div>
                        <div class="search-filter-scope">
                            <input type="radio" name="scope" id="home-search-scope-local" value="local" checked="checked" />
                            <label for="home-search-scope-local">Search Cornell University</label>
                            <br />
                            <input type="radio" name="scope" id="home-search-scope-national" value="national" />
                            <label for="home-search-scope-national">Search all VIVO institutions</label>
                        </div>
                    </div>
                    <input type="submit" value="Search" class="search">
                </div>
            </form>
        </fieldset>
    </section>
</header>