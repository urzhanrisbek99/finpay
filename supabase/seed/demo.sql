do $$
declare
  v_uid uuid;
  v_tz text := 'Asia/Almaty';
  v_today timestamp := date_trunc('day', now() at time zone 'Asia/Almaty');
  v_day timestamptz := date_trunc('day', now() at time zone 'Asia/Almaty') at time zone 'Asia/Almaty';
begin
  select id into v_uid from auth.users where email = 'demo@finpay.app';

  if v_uid is null then
    raise exception 'demo@finpay.app not found — register the account first';
  end if;

  delete from public.transactions
  where user_id = v_uid
    and created_at < v_day;

  insert into public.transactions
    (user_id, type, amount, merchant, category, status, method, comment, created_at)
  select
    v_uid, d.type,
    case when d.type = 'income' then d.amount
         else round(d.amount * m.scale / 100) * 100 end,
    d.merchant, d.category, d.status, d.method, d.comment,
    (m.month_start + (d.day - 1) * interval '1 day' + d.hour * interval '1 hour')
      at time zone v_tz
  from (values
    (0,  0.95),
    (-1, 1.00),
    (-2, 1.06),
    (-3, 0.97)
  ) as s(month_offset, scale)
  cross join lateral (
    select
      s.month_offset,
      s.scale,
      date_trunc('month', v_today) + s.month_offset * interval '1 month' as month_start
  ) as m
  join (values
    (1,  9,  'expense',  18400, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null),
    (1,  20, 'expense',  2900,  'Yandex Go',                    'transport',    'completed', 'qr',    null,            null),
    (1,  10, 'income',   850000,'Salary — TechCorp',            'salary',       'completed', null,    null,            null),
    (2,  8,  'expense',  1900,  'Coffee Boom',                  'food',         'completed', 'qr',    null,            null),
    (2,  10, 'expense',  4490,  'Netflix',                      'subscription', 'completed', 'card',  null,            null),
    (3,  13, 'transfer', 15000, 'Transfer to +77012345678',     'transfer',     'completed', 'phone', 'Rent share',    null),
    (3,  19, 'expense',  7850,  'Wolt',                         'food',         'completed', 'qr',    null,            null),
    (4,  18, 'expense',  3200,  'Yandex Go',                    'transport',    'completed', 'qr',    null,            null),
    (5,  12, 'expense',  2290,  'Spotify',                      'subscription', 'completed', 'card',  null,            null),
    (6,  11, 'expense',  24800, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null),
    (7,  9,  'expense',  2100,  'Coffee Boom',                  'food',         'completed', 'qr',    null,            null),
    (8,  19, 'expense',  32400, 'Small',                        'food',         'completed', 'qr',    null,            null),
    (9,  20, 'expense',  12300, 'Wolt',                         'food',         'completed', 'qr',    null,            null),
    (10, 18, 'expense',  3600,  'Yandex Go',                    'transport',    'completed', 'qr',    null,            null),
    (11, 12, 'transfer', 40000, 'Transfer to +77023456789',     'transfer',     'completed', 'phone', 'Dinner',        null),
    (12, 16, 'expense',  18500, 'Kaspi Marketplace',            'shopping',     'completed', 'card',  null,            null),
    (13, 11, 'expense',  26400, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null),
    (14, 15, 'expense',  67000, 'Mechta',                       'shopping',     'completed', 'card',  null,            0),
    (14, 15, 'expense',  52000, 'Technodom',                    'shopping',     'completed', 'card',  null,            -1),
    (14, 15, 'expense',  45000, 'Sulpak',                       'shopping',     'completed', 'card',  null,            -2),
    (14, 15, 'expense',  61000, 'Technodom',                    'shopping',     'completed', 'card',  null,            -3),
    (15, 9,  'expense',  2400,  'Coffee Boom',                  'food',         'completed', 'qr',    null,            null),
    (16, 20, 'expense',  9200,  'Wolt',                         'food',         'completed', 'qr',    null,            null),
    (17, 18, 'transfer', 60000, 'Transfer to card 5169293812447701', 'transfer','completed', 'card',  'Birthday gift', -1),
    (18, 14, 'income',   145000,'Freelance — landing page',     'other',        'completed', null,    null,            -3),
    (18, 14, 'income',   210000,'Freelance — mobile app',       'other',        'completed', null,    null,            -1),
    (18, 14, 'income',   320000,'Freelance project',            'other',        'completed', null,    null,            0),
    (19, 11, 'expense',  31200, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null),
    (20, 15, 'expense',  95000, 'Kaspi Marketplace',            'shopping',     'failed',    'card',  null,            -1),
    (20, 19, 'expense',  5600,  'Yandex Go',                    'transport',    'completed', 'qr',    null,            null),
    (21, 10, 'expense',  38900, 'Kaspi Marketplace',            'shopping',     'completed', 'card',  null,            null),
    (22, 20, 'expense',  15800, 'Wolt',                         'food',         'completed', 'qr',    null,            null),
    (24, 9,  'expense',  8700,  'Coffee Boom',                  'food',         'completed', 'qr',    null,            null),
    (25, 13, 'transfer', 25000, 'Transfer to +77054567890',     'transfer',     'completed', 'phone', 'Taxi',          null),
    (26, 11, 'expense',  28900, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null),
    (27, 18, 'expense',  3100,  'Yandex Go',                    'transport',    'completed', 'qr',    null,            null),
    (28, 12, 'expense',  22100, 'Magnum Cash&Carry',            'food',         'completed', 'qr',    null,            null)
  ) as d(day, hour, type, amount, merchant, category, status, method, comment, only_month)
    on d.only_month is null or d.only_month = m.month_offset
  where m.month_start + (d.day - 1) * interval '1 day' < v_today;

  insert into public.recipients (user_id, name, phone)
  values
    (v_uid, 'Asel',   '7012345678'),
    (v_uid, 'Nurlan', '7023456789'),
    (v_uid, 'Dana',   '7017654321')
  on conflict (user_id, phone) do nothing;

  update public.profiles
  set balance = (
    select coalesce(sum(case when type = 'income' then amount else -amount end), 0)
    from public.transactions
    where user_id = v_uid
      and status = 'completed'
  )
  where id = v_uid;
end
$$;
