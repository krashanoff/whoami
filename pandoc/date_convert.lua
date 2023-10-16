function Meta(meta)
  -- Parses a timestamp formatted like:
  -- 2022-05-24T21:00:00-08:00
  --
  -- Into something like:
  -- 24 May 2022
  if meta.date then
    local format = "(%d+)-(%d+)-(%d+)T%d+:%d+:%d+-%d+:%d+"
    local y, m, d = pandoc.utils.stringify(meta.date):match(format)
    local date = os.time({
      year = y,
      month = m,
      day = d,
    })

    meta.date = pandoc.Str(os.date("%d %B %Y", date))
  end
  if meta.updated then
    local format = "(%d+)-(%d+)-(%d+)T%d+:%d+:%d+-%d+:%d+"
    local y, m, d = pandoc.utils.stringify(meta.updated):match(format)
    local date = os.time({
      year = y,
      month = m,
      day = d,
    })

    meta.updated = pandoc.Str(os.date("%d %B %Y", date))
  end

  return meta
end
